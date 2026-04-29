import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { GeoJson } from './map';

export interface Video {
  id?: string;
  videoId?: number;
  name: number;
  description?: string;
  topics?: string;
  topicsDisplay?: string;
  methods?: string;
  related?: string;
  keywords?: string;
  youtubeId?: string;
  youtubeURL?: string;
  datetime?: number;
  lengthInSeconds?: number;
  lengthDisplay?: string;
  author?: string,
  geometry?: {},
  zoom?: number,
  bearing?: number
}

@Injectable({
  providedIn: 'root'
})
export class VideosService {

  private _videos = new BehaviorSubject<GeoJson[]>([]);
  private dataStore: { 
    videos: GeoJson[]
  } = {
    videos: []
  }; // store our data in memory
  readonly videos = this._videos.asObservable();

  topics = ['Value-Chain Analysis', 'Livelihoods', 'Environmental Change', 'Forest Inventory', 'Biodiversity'];
  topicsNew = [
    {slug: 'value-chain', name: 'Value-Chain Analysis'},
    {slug: 'livelihoods', name: 'Livelihoods'},
    {slug: 'env-change', name: 'Environmental Change'},
    {slug: 'forest-inventory', name: 'Forest Inventory'},
    {slug: 'biodiversity', name: 'Biodiversity'},
  ]
  methods = ['Focus Group Discussion', 'Personal Interview', 'Household Interview', 'Field Measurement', 'Historical Data'];
  methodsNew = [
    {slug: 'focus-group-discussion', name: 'Focus Group Discussion'},
    {slug: 'key-informant-interview', name: 'Key Informant Interview'},
    {slug: 'personal-interview', name: 'Personal Interview'},
    {slug: 'household-interview', name: 'Household Interview'},
    {slug: 'group-interview', name: 'Group Interview'},
    {slug: 'field-measurement', name: 'Field Measurement'}
  ]
  
  media = ['360°', 'Photos', 'Videos', 'Timelapse', 'Podcasts'];
  authors = ['Thomas Moon', 'Adrián Monge'];

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
  ) { }

  getVideos() {
    return this._videos.asObservable();
  }

  loadAll(filters:object = null) {

    this.db.collection<GeoJson>('videos').valueChanges({ idField: 'id' }).subscribe(data => {     
      
      // Augment data with display fields (done here so front, ie. tables can be dumb)
      data.map(item => {
        if (item.properties && item.properties.topics) {
          item.properties.topicsDisplay += item.properties.topics.split(',').map(topicId=>{
            return this.topics[topicId] + ' ';
          });
        }

        return item;
      });

      // Filters can be passed to loadAll
      if (filters) {

        //console.log("Filter comments");

        data = data.filter(item=>{

          // must match all filters
          let matchedFields = 0;

          for (const filter in filters) {

            //console.log(`Match by ${filter} = ${filters[filter]}`);

            if (filter === 'topics' && item[filter]) {
              console.log(item[filter].search(filters[filter]));
            }
            
            if (item[filter] === filters[filter]) {
              //console.log("Matched");
              matchedFields++;
            }
          }

          if (matchedFields === Object.keys(filters).length) {
            return true;
          }

          return false;
        });
      }

      // Sort by datetime, oldest to newest
      data = data.sort((a,b)=>{
        // some dates need adjusting, so just use videoId
        //return a.datetime - b.datetime;
        return a.properties.videoId - b.properties.videoId;
      });

      //console.log("Output comments to console.");
      //console.log(data);

      this.dataStore.videos = data;
      this._videos.next(Object.assign({}, this.dataStore).videos);

    }, error => console.log('Could not load comments.'));
  }

  loadByTopic(topicId: string) {

    let filters = {
      topics: topicId
    }

    //console.log("Load coments for video");
    //console.log(filters);

    this.loadAll(filters);
  }

  async add (data: GeoJson) {

    try {
      await this.db.collection<GeoJson>('videos').add(data);
      console.log("Video added successfully");
    }
    catch (error) {
      console.log("Could not add video");
      console.log(error);
    }
  }
}
