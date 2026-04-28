import { Component, Input, Inject, forwardRef, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
    standalone: false
})
export class ToolsComponent implements OnInit {

  @Input() locations: any;
  @Input() topics: string[];
  @Input() topicsNew: {}[];
  @Input() methods: string[];
  @Input() methodsNew: {}[];
  @Input() media: string[];
  @Input() authors: string[];
  @Input() locIndex: number;
  @Input() tabIndex: number;
  @Input() topicIndex: string;
  @Input() methodIndex: string;

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

  // If the topic is active then current, otherwise 1
  public topicLocIndex(topicSlug:string) {
    if (this.topicIndex === topicSlug) {
      return this.locIndex + 1;
    } else {
      return '1';
    }
  }

  // If the method is active then current, otherwise 1
  public methodLocIndex(methodSlug:string) {
    if (this.methodIndex === methodSlug) {
      return this.locIndex + 1;
    } else {
      return '1';
    }
  }
}
