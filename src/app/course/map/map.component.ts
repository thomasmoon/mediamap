import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../../services/map.service';
import { GeoJson, FeatureCollection } from '../../services/map';

// Mapbox
import { WorldTypeControl } from './world-type-control/world-type-control';
import { CourseComponent } from '../../course/course.component';
import { VideosService } from 'src/app/services/videos.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    standalone: false
})
export class MapComponent implements OnInit{

  // Refs
  course: any;

  updateViewOnce: boolean = false;

  // Default settings for Map
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v10';
  lat = 19.888900;
  lng = 102.133700;
  defaultBearing = 190;
  currentBearing: number;
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

  ngOnInit() {
    this.markers = this.videosService.videos;

    let filters: any = {};

    if (this.course.topicIndex !== null) {
      filters.topics = this.course.topicIndex;
    } else if (this.course.methodIndex !== null) {
      filters.methods = this.course.methodIndex;
    }
      
    this.videosService.loadAll(filters);
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {

    this.buildMap();
  }

  buildMap() {
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

        //console.log('Subscribe to markers');
        //console.log(markers);

        // If we have markers fire up the course and map locations, once only
        if (markers.length && !this.updateViewOnce) {
          this.updateViewOnce = true;
          this.course.videos = markers;
          this.course.updateView();

          let data = new FeatureCollection(markers)
          this.source.setData(data);
        }
      });

      /*
      /// subscribe to realtime database and set data source
      this.tasksDynamic.subscribe(tasksDynamic => {

        this.tasks = tasksDynamic;

        let data = new FeatureCollection(tasksDynamic)
        this.source.setData(data)
      });*/


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

  /// Helpers
  removeMarker(marker: mapboxgl.Marker) {
    this.mapService.removeMarker(marker.getElement.name)
  }

  setPitch(pitch: number) {
    this.map.setPitch(this.currentPitch + pitch);
  }

  setBearing(bearing: number) {
    this.map.setBearing((this.currentBearing - bearing) % 360);
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
