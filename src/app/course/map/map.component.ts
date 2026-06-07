import { Component, OnDestroy, OnInit, forwardRef, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MapService } from '../../services/map.service';
import { GeoJson, FeatureCollection } from '../../services/map';
import { WorldTypeControl } from './world-type-control/world-type-control';
import { CourseComponent } from '../../course/course.component';
import { VideosService } from 'src/app/services/videos.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-map',
    standalone: false,
    styleUrls: ['./map.component.scss'],
    templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  course: any;
  updateViewOnce: boolean = false;

  // Default settings for Map
  map: any;
  style = 'mapbox://styles/mapbox/outdoors-v10';
  lat = 19.888900;
  lng = 102.133700;
  defaultBearing = 190;
  currentBearing: number = this.defaultBearing;
  defaultPitch = 60;
  currentPitch = this.defaultPitch;
  hidden: boolean = false;

  // data
  source: any;
  markers: any;
  tasksDynamic: any;

  links: any;

  constructor(
    @Inject(forwardRef(() => CourseComponent)) course,
    // Map service
    private mapService: MapService,
    private videosService: VideosService,
  ) {
    this.course = course;
  }

  async ngOnInit() {
    this.markers = this.videosService.videos;
    let filters: any = {};
    if (this.course.topicIndex !== null) {
      filters.topics = this.course.topicIndex;
    } else if (this.course.methodIndex !== null) {
      filters.methods = this.course.methodIndex;
    }
    this.videosService.loadAll(filters);
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) { // SSR check to ensure this runs in the browser
      const mapboxgl = (await import(/* @vite-ignore */ 'mapbox-gl')).default // dynamically import mapbox-gl

      mapboxgl.accessToken = environment.mapbox.accessToken
      this.map = new mapboxgl.Map({
        container: 'map',
        style: this.style,
        zoom: 15,
        pitch: this.defaultPitch,
        bearing: this.defaultBearing,
        center: [this.lng, this.lat] as mapboxgl.LngLatLike,
        trackResize: true
      });

      // Disable scroll wheel
      if (this.map.scrollZoom) {
        this.map.scrollZoom.disable();
      }

      // Fullscreen
      this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // World Type control (3D/2D)
      this.map.addControl(new WorldTypeControl(), 'top-right');

      // Navigation
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Track bearing and pitch changes from user interaction
      this.map.on('rotate', () => {
        const newBearing = this.map.getBearing();
        // Only update if change is significant (more than 1 degree)
        if (Math.abs(newBearing - this.currentBearing) > 1) {
          this.currentBearing = newBearing;
          if (this.course.video) {
            this.course.video.setYTbearing(this.currentBearing);
          }
        }
      });

      this.map.on('pitch', () => {
        const newPitch = this.map.getPitch();
        // Only update if change is significant (more than 1 degree)
        if (Math.abs(newPitch - this.currentPitch) > 1) {
          this.currentPitch = newPitch;
          if (this.course.video) {
            this.course.video.setYTpitch(this.currentPitch);
          }
        }
      });

      // Click Marker
      this.map.on('click', 'locations', function (e: mapboxgl.MapTouchEvent) {

        this.flyTo(e.features[0]);

        this.routeEventInitiated = false;
        this.listInitiated = false;
        
        this.course.router.navigate(['/videoId', e.features[0].properties.videoId])

      }.bind(this));

      /// Add realtime firebase data on map load
      this.map.on('load', () => {

        /// register source
        this.map.addSource('firebase', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        /// get source
        this.source = this.map.getSource('firebase')

        /// subscribe to realtime database and set data source
        this.markers.subscribe(markers => {
          // If we have markers fire up the course and map locations, once only
          if (markers.length && !this.updateViewOnce) {
            this.updateViewOnce = true;
            this.course.videos = markers;
            this.course.updateView();

            let data = new FeatureCollection(markers)
            this.source.setData(data);
          }
        });

        /// create map layers with realtime data
        this.map.addLayer({
          id: 'locations',
          source: 'firebase',
          type: 'symbol',
          layout: {
            'icon-image': 'cinema-15',
            'icon-size': 1,
            'text-offset': [0, 1.5],
            'text-field': '{shortname}',
            'text-optional': true
          },
          paint: {
            'text-color': '#121220',
            'text-halo-color': '#fff',
            'text-halo-width': 2
          }
        });
      })
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  /// Helpers
  removeMarker(marker: mapboxgl.Marker) {
    this.mapService.removeMarker(marker.getElement.name)
  }

  setPitch(pitch: number) {
    // Clamp pitch to valid range [-85, 85]
    const newPitch = Math.max(-85, Math.min(85, pitch));
    this.currentPitch = newPitch;
    this.map.setPitch(newPitch);
  }

  setBearing(bearing: number) {
    // Normalize bearing to [0, 360)
    let newBearing = bearing % 360;
    if (newBearing < 0) {
      newBearing += 360;
    }
    this.currentBearing = newBearing;
    this.map.setBearing(newBearing);
  }

  flyTo(data: GeoJson, zoom = 15) {

    // Hide the map if we don't have lat & long
    if (!data.geometry.coordinates[0] || !data.geometry.coordinates[1] ) {
      this.hidden = true;
      return false;
    }

    // Fly to location
    this.map.flyTo({
      center: data.geometry.coordinates as mapboxgl.LngLatLike,
      zoom: zoom
      /*,
      curve: 1, // change the speed at which it zooms out
 
      // This can be any easing function: it takes a number between
      // 0 and 1 and returns another number between 0 and 1.
      easing: function (t) { return t; }*/
    })

    // Make sure the map is visible
    this.hidden = false;
  }
}
