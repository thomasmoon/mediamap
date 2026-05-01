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
      rel: 0,
      fs: 1,          // Enable fullscreen button (required for 360° controls)
      modestbranding: 0,  // Show YouTube branding
      controls: 1      // Show player controls
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
    // Enable 360° video interactive mode
    // Note: As of 2026, YouTube's embedded player has limitations on 360° video interaction
    // via mouse drag. The setSphericalProperties API allows programmatic control,
    // but native drag interaction may be limited or require fullscreen mode.
    // Setting enableOrientationSensor to false allows API-based control on mobile.
    if (event.target.setSphericalProperties) {
      try {
        event.target.setSphericalProperties({
          enableOrientationSensor: false
        });
      } catch (e) {
        console.log("Could not set initial spherical properties:", e);
      }
    }
    
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
    if (videoId !== null) {
      this.YTparams.videoId = videoId;
    }

     // if the Youtube API is loaded
    if (this.YTloaded) {
      // If the player exists load new video
      if (this.YTplayer) {
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
        // Create new player
        this.YTplayer = new (<any>window).YT.Player('player', this.YTparams);
      }

      // When video is playing begin the routine to get bearing
      if (!this.YTbearingRoutineInitiated) {
        this.getVideoBearing();
      }

    } else {
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

  setYTbearing(bearing: number) {
    // Update video bearing based on map bearing (absolute value, not delta)
    if (typeof this.YTplayer !== 'undefined' && this.YTplayer && this.YTplayer.setSphericalProperties) {
      this.YTbearing = bearing;
      try {
        this.YTplayer.setSphericalProperties({
          yaw: bearing,
          pitch: this.YTpitch !== undefined ? this.YTpitch : 0,
          roll: 0
        });
      } catch (e) {
        console.log("Could not set spherical properties:", e);
      }
    }
  }

  setYTpitch(pitch: number) {
    // Update video pitch based on map pitch (absolute value, not delta)
    if (typeof this.YTplayer !== 'undefined' && this.YTplayer && this.YTplayer.setSphericalProperties) {
      this.YTpitch = pitch;
      try {
        this.YTplayer.setSphericalProperties({
          yaw: this.YTbearing !== undefined ? this.YTbearing : 0,
          pitch: pitch,
          roll: 0
        });
      } catch (e) {
        console.log("Could not set spherical properties:", e);
      }
    }
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
