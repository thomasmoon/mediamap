import { Component, Input, Inject, forwardRef, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {

  @Input() locations: any;
  @Input() topics: string[];
  @Input() topicsNew: {}[];
  @Input() methods: string[];
  @Input() methodsNew: {}[];
  @Input() media: string[];
  @Input() authors: string[];
  @Input() tabIndex: number;
  @Input() topicIndex: number;
  @Input() methodIndex: number;

  listInitiated = false;

  constructor(
    /*@Inject(forwardRef(() => CourseComponent))
    public course:any*/
  ) {
  }

  ngOnInit() {
  }

  resetRoute() {
    console.log('reset route');
  }

  ngAfterContentInit() {

    // Run this after lists are loaded
    let locList = $('.mat-tab-body-content'),
    locSelected = locList.find('a.active');

    // if we have a location list and it has not been init'd
    if (!this.listInitiated && locList.length > 0 && locSelected.length > 0) {

      let activeItemRelativeTop = locSelected.offset().top - locList.offset().top;

      // if the active item is off the viewport - one row
      locList.scrollTop(locList.scrollTop() + activeItemRelativeTop);

      // Only do this once
      this.listInitiated = true;

      // console.log('List initiated');
    }
  }

}
