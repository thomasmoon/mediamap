import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// View Children
import { Dialog } from '../dialog/dialog.component';
import { ToolsComponent } from './tools/tools.component';
import { MapComponent } from './map/map.component';
import { ContentComponent } from './content/content.component';
import { VideoComponent } from './video/video.component';
import { VideosService } from '../services/videos.service';
import { BehaviorSubject } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { CourseSidenavService } from '../services/coursesidenav.service';

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss'],
    standalone: false
})
export class CourseComponent implements OnInit {

  // For display of videos on mobile
  @ViewChild(Dialog) dialog: Dialog;
  @ViewChild(ContentComponent) contentComponent: ContentComponent;
  @ViewChild(VideoComponent) video: VideoComponent;
  @ViewChild(ToolsComponent) tools: ToolsComponent;
  @ViewChild('courseSidenav') public courseSidenav: MatSidenav;

  // Map nested in content
  private map: MapComponent;

  // Tools (Locations & Tasks)
  locations: any;
  videos: any;
  videosFiltered: any;
  topics: string[];
  topicsNew: {}[];
  methods: string[];
  methodsNew: {}[];

  content = '';
  title = '';
  currentTopics = [];
  currentMethods = [];
  currentKeywords = [];

  public locIndex: number;
  public locIndexSub: any;
  public videoId;
  public videoIdSub: any;

  // video index for children (e.g. comments)
  private _videoIndex = new BehaviorSubject<any>(null);
  readonly videoIndexObs = this._videoIndex.asObservable();

  public topicIndex: number = null;
  public methodIndex: number = null;

  public autoplay: boolean = false;

  // Route handling
  routeEventInitiated = false;
  listInitiated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public videosService: VideosService,
    public courseSidenavService: CourseSidenavService
  ) { 
    this.topics = videosService.topics;
    this.topicsNew = videosService.topicsNew;
    this.methods = videosService.methods;
    this.methodsNew = videosService.methodsNew;
  }

  ngOnInit() {

    if (localStorage.getItem('autoplay') !== null) {

      // check for autoplay preference
      this.autoplay = localStorage.getItem('autoplay') == 'true';

    } else {
      
      // otherwise default by screen size
      this.autoplay = window.innerWidth > 600;
    }
  }

  ngAfterViewInit() {

    console.log('course component after view init');
    // set reference to map
    this.map = this.contentComponent.map;

    // set the course sidenav
    this.courseSidenavService.setSidenav(this.courseSidenav);

    // This is such a weird way to handle this, but this call back fires so many times
    if (this.routeEventInitiated === false) {
    }
  }

  updateView() {

    //console.log("update view");

     // Actions based on active route
     this.locIndexSub = this.route.params.subscribe(params => {

      //console.log("Route subscription");
      //console.log(params);

      // This is just getting crazy, so many event leaks
      if (this.videos && this.videos.length) {

        // TODO: list only needs refreshing if topic or method changes
        this.videosFiltered = this.videos;

        // topic index
        if (params['topicIndex']) {
          this.topicIndex = params['topicIndex'];
          this.videosFiltered = this.videosFiltered.filter(video => {
            if (video.properties.topics && video.properties.topics.search(this.topicIndex) > -1) {
              return true;
            }
          });
        } else {
          this.topicIndex = null;
        }
      
        // method index
        if (params['methodIndex']) {
          this.methodIndex = params['methodIndex'];
          this.videosFiltered = this.videosFiltered.filter(video => {
            if (video.properties.methods && video.properties.methods.search(this.methodIndex) > -1) {
              return true;
            }
          });
        } else {
          this.methodIndex = null;
        }

        // location index
        this.locIndex = +params['locIndex'] - 1; // (+) converts string 'id' to a number

        // if we have a video id, find the index
        if (params['videoId']) {
          let videoId = parseInt(params['videoId']);

          let videoIndex = this.videosFiltered.findIndex(video=>{
            return video.properties.videoId === videoId;
          });

          if (videoIndex > -1) {
            this.locIndex = videoIndex;
            // update route for now until (if) we do main routes by video ids
            this.router.navigate(['/loc', this.locIndex+1]);
          }
        }

        // When we have a location
        if (this.videosFiltered[this.locIndex]) {

          // dispatch the location
          this._videoIndex.next(this.locIndex);

          // video id (GoPro id)
          this.videoId = this.videosFiltered[this.locIndex].properties.videoId;

          // We only need to do it once
          this.routeEventInitiated = true;

          if (this.videosFiltered[this.locIndex].properties.hasOwnProperty('name')) {
            this.title = this.videosFiltered[this.locIndex].properties.name;
          } else {
            this.title = "";
          }

          if (this.videosFiltered[this.locIndex].properties.hasOwnProperty('description')) {
            this.content = this.videosFiltered[this.locIndex].properties.description;
          } else {
            this.content = "";
          }
          
          if (this.videosFiltered[this.locIndex].properties.hasOwnProperty('topics')
            && this.videosFiltered[this.locIndex].properties.topics !== null) {
            this.currentTopics = this.videosFiltered[this.locIndex].properties.topics.split(',');
          } else {
            this.currentTopics = [];
          }

          this.currentTopics = this.getLocationPropertyAsArray('topics');
          this.currentMethods = this.getLocationPropertyAsArray('methods');
          this.currentKeywords = this.getLocationPropertyAsArray('keywords');

          let zoom = 16,
              // Default bearing is 0 in 2D mode
              bearing = window['map-world-mode'] !== 1 && this.map ? this.map.defaultBearing : 0;

          // custom bearing if in 3D map mode
          if (this.videosFiltered[this.locIndex].properties.hasOwnProperty('bearing') && window['map-world-mode'] !== 1) {
            bearing = this.videosFiltered[this.locIndex].properties.bearing;
          }

          // custom zoom
          if (this.videosFiltered[this.locIndex].hasOwnProperty('zoom')) {
            zoom = this.videosFiltered[this.locIndex].properties.zoom;
          }

          this.map.currentBearing = bearing;
          this.map.map.setBearing(bearing);

          // Fly to the location with given zoom
          this.map.flyTo(this.videosFiltered[this.locIndex], zoom);

          //console.log('Play video from update view.');
          this.video.playVideo(this.videosFiltered[this.locIndex].properties.youtubeId);
        }
      }
    });
  }

  resetRouter() {
    this.routeEventInitiated = false;
  }

  nextLocation() {

    //console.log('next location');

    // If we have additional locations then go to the next one
    if (this.locIndex < this.videosFiltered.length - 1) {
      this.locIndex++;
      this.routeEventInitiated = false;

      if (this.topicIndex !== null) {
        this.router.navigate([`/topic/${this.topicIndex}/loc`, this.locIndex + 1]);
      } else if (this.methodIndex !== null) {
        this.router.navigate([`/method/${this.methodIndex}/loc`, this.locIndex + 1]);
      } else {
        this.router.navigate(['/loc', this.locIndex + 1])
      }
      
      this.updateView();
    }
  }

  // Add a zero before the number for single digits
  formatVideoIndex(i:number) {
    let id = i+1,
        zeroPadding = id < 10 ? '0':'';
    return zeroPadding + id;
  }

  // if the location has this property parse string to array
  getLocationPropertyAsArray(prop: string) {

    let value = [];

    if (this.videosFiltered[this.locIndex].properties.hasOwnProperty(prop)
      && this.videosFiltered[this.locIndex].properties[prop] !== null) {

      value = this.videosFiltered[this.locIndex].properties[prop].split(',');
    }

    return value;
  }

  getRouterLink(index) {
    if (this.topicIndex) {
      return ['/topic', this.topicIndex, index];
    } else if (this.methodIndex) {
      return ['/method', this.methodIndex, index];
    } else {
      return ['/loc', index];
    }
  }

  public courseSidenavMode() {

    if (window.innerWidth <= 600) {
      return 'over';
    } else {
      return 'side';
    }
  }

  public courseSidenavOpened() {

    if (window.innerWidth <= 600) {
      return false;//this.courseSidenavService.isOpen();
    } else {
      return true;
    }
  }

  public toggleAutoplay(event) {

    this.autoplay = event.checked;
    localStorage.setItem('autoplay', this.autoplay.toString());

    // start playback when we turn this on
    if (this.autoplay) {
      // if the player is not already playing, then fire it up
      if (!this.video.playing) {
        this.video.playVideo(null);
      }
    }
    
  }
}
