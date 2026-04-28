import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'media-tools',
    templateUrl: './media-tools.component.html',
    styleUrls: ['./media-tools.component.scss'],
    standalone: false
})
export class MediaToolsComponent implements OnInit {

  locations: any;
  tasks: any;

  constructor() { }

  ngOnInit() {
  }

}
