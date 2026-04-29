import { Component, OnInit } from '@angular/core';
import { VideosService } from 'src/app/services/videos.service';

import readXlsxFile from 'read-excel-file/browser'
import { IGeoJson } from 'src/app/services/map';

@Component({
    selector: 'app-videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.scss'],
    standalone: false
})
export class VideosComponent implements OnInit {

  public columns: string[] = ['properties.videoId', 'properties.name'];
  public columnLabels: string[] = ['Id', 'Name'];
  public videos: any;
  private excelFile: any;

  constructor(
    private videosService: VideosService
  ) { }

  ngOnInit() {
    // subscribe to entire collection
    this.videos = this.videosService.videos;
    this.videosService.loadAll();
  }

  fileChange(e: any) {
    if (e.target.files && e.target.files[0]) {
      this.excelFile = e.target.files[0];
    }
  }

  importExcel() {

    console.log('Import Excel');

    readXlsxFile(this.excelFile).then((rows) => {
      // `rows` is an array of rows
      // each row being an array of cells.
      console.log('Excel rows:');
      console.log(rows);

      let tableHeaders = rows.shift();

      console.log("Table headers:");
      console.log(tableHeaders);

      // Add each video to Firebase
      rows.forEach(row=>{

      // if import flag is true and youtube url exists
      if (row[1] && row[10] !== null) {

          let newVideo: IGeoJson = {

            type: 'Feature',
            geometry: {
              coordinates: [row[15], row[14]], // lon lat (reversed)
              type: 'Point'
            },
            properties: {
              videoId: row[0],
              topics: row[4],
              name: row[5],
              description: row[6],
              methods: row[7],
              related: row[8],
              keywords: row[9],
              youtubeId: row[10].replace('https://youtu.be/',''),
              youtubeURL: row[10],
              datetime: Date.parse(row[2]),
              zoom: row[16],
              bearing: row[17]
            }
          }

          this.videosService.add(newVideo);
        }
      })


    });

    return false;
  }
}
