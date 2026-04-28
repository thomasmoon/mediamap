import { Component, Input, OnInit, Inject, forwardRef, ViewChild } from '@angular/core';
import { CourseComponent } from '../course.component';
import { MapComponent } from '../map/map.component';

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss'],
    standalone: false
})
export class ContentComponent implements OnInit {

  @ViewChild(MapComponent) map: MapComponent;

  @Input() videoId: string;
  @Input() title: string;
  @Input() content: string;
  @Input() topics: string[];
  @Input() methods: string[];
  @Input() keywords: string[];

  course: any;

  constructor(

    @Inject(forwardRef(() => CourseComponent)) course

  ) { 
    this.course = course;
  }

  ngOnInit() {
  }

}
