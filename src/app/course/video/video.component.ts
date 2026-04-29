import { Component, Input, OnInit, forwardRef, Inject } from '@angular/core';
import { CourseComponent } from '../../course/course.component';

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss'],
    standalone: false
})
export class VideoComponent implements OnInit {

  @Input() videoId: string;

  // Refs
  course: any;

  // player is playing?
  public playing: boolean = false;

  // YouTube
  _window = window;
  YTloaded = false;
  YTplayer: any;
  YTparams = {
    videoId: null,
    width: 560,
    height: 315,
    events: {
      'onReady': this.onPlayerReady.bind(this),
      'onStateChange': this.onPlayerStateChange.bind(this)
    },
    playerVars: {
      rel: 0
    }
  };
  YTbearingRoutineInitiated = false;
  YTbearing: number;
  YTpitch: number;

  constructor(

    @Inject(forwardRef(() => CourseComponent)) course

  ) { 
    this.course = course;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {

    //console.log('Video component after view init');
    
    this.loadYoutubeApi();
  }

  // YouTube stuff
  loadYoutubeApi() {

    // If we already have the script then skip this
    if (typeof (<any>window).YT !== 'undefined') {
      this.YTloaded = true;
      return false;
    }

    //console.log('Adding Youtube script');

    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // set global access to this function on this component
    (<any>window).onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
  }

  onYouTubeIframeAPIReady() {
    this.YTloaded = true;
  }

  // API will call this function when the video player is ready.
  onPlayerReady(event) {

    //console.log('onPlayerReady');
    //console.log(event);
    if (this.course.autoplay) {
      event.target.playVideo();
    }
  }
  
  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  onPlayerStateChange(event) {

    //console.log('Player event', event);
    this.playing = event.data == (<any>window).YT.PlayerState.PLAYING;

    // When the clip is ended go to next
    if (event.data == (<any>window).YT.PlayerState.ENDED) {
      this.course.nextLocation();
    }
  }

  playVideo(videoId: any) {

    //console.log('playVideo');

    if (videoId !== null) {
      this.YTparams.videoId = videoId;
    }

     // if the Youtube API is loaded
    if (this.YTloaded) {

      //console.log('YouTube API is loaded');
      //console.log(this);

      // If the player exists load new video
      if (this.YTplayer) {

        //console.log('YouTube player exists');

        if (this.course.autoplay) {

          // Only when autoplay is toggled on will we not have an id
          if (videoId === null) {

            this.YTplayer.playVideo();

          } else {

            // If the load video function exists
            if (this.YTplayer.loadVideoById) {
              this.YTplayer.loadVideoById(this.YTparams.videoId);
            } else {
              console.log("this.YTplayer.loadVideoById does not exist");
            }

          }

        } else {

          // cue video
          if (this.YTplayer.cueVideoById) {
            this.YTplayer.cueVideoById(this.YTparams.videoId);
          } else {
            console.log("this.YTplayer.cueVideoById does not exist");
          }
        }

      } else {
        //console.log('Create Youtube player');

        // Create new player
        this.YTplayer = new (<any>window).YT.Player('player', this.YTparams);
      }

      // When video is playing begin the routine to get bearing
      if (!this.YTbearingRoutineInitiated) {
        //console.log('Get video bearing');
        this.getVideoBearing();
      }

    } else {

      //console.log('Load Youtube api');
      //console.log(this);

      this.loadYoutubeApi();

      /* otherwise retry when it is*/
      setTimeout(()=>{
        this.playVideo(videoId);
      }, 1000);
    }
  }

  stopVideo() {
    this.YTplayer.stopVideo();
  }

  getVideoBearing () {

    this.YTbearingRoutineInitiated = true;

    if(typeof this.YTplayer !== 'undefined' && this.YTplayer.hasOwnProperty('getSphericalProperties')) {

      let sphericalProps = this.YTplayer.getSphericalProperties();

      // Yaw
      if (typeof sphericalProps !== 'undefined' && sphericalProps.hasOwnProperty('yaw')) {

        // if the bearing has changed update the map
        if (this.YTbearing !== sphericalProps.yaw ) {
          this.YTbearing = sphericalProps.yaw;

          // When we are in 3D mode
          if (window['map-world-mode'] !== 1) {
            this.course.map.setBearing(this.YTbearing);
          }
        }
      }

      // Pitch
      if (typeof sphericalProps !== 'undefined' && sphericalProps.hasOwnProperty('pitch')) {

        // if the pitch has changed and is negative update the pitch of the map
        if (this.YTpitch !== sphericalProps.pitch && sphericalProps.pitch <= 0) {
          this.YTpitch = sphericalProps.pitch;

          // When we are in 3D mode
          if (window['map-world-mode'] !== 1) {
            this.course.map.setPitch(this.YTpitch);
          }
        }
      }
    }

    requestAnimationFrame(this.getVideoBearing.bind(this));
  }
}
