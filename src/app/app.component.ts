import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavService } from './services/sidenav.service';
import { CourseSidenavService } from './services/coursesidenav.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav') public sidenav: MatSidenav;

  title = 'Online Course in Tropical Forestry';

  pageParams: any;
  sidenavOpened: boolean;

  user:any;

  loginItems:any = [
    {
      id: 'google',
      icon: 'email',
      text: 'Google',
      route: '/'
    },
    {
      id: 'facebook',
      icon: 'thumb_up',
      text: 'Facebook',
      route: '/'
    },
    {
      id: 'twitter',
      icon: 'chat',
      text: 'Twitter',
      route: '/'
    },
    {
      id: 'github',
      icon: 'people',
      text: 'Github',
      route: '/'
    },
    {
      id: 'uni',
      icon: 'school',
      text: 'University of Helsinki',
      info: '(coming soon)',
      route: '/'
    },
  ];


  menuItems:any = [
    {
      icon: 'menu_book',
      text: 'Course Content',
      route: '/'
    }
  ]

  adminMenuItems:any = [
    {
      icon: 'video_library',
      text: 'Videos',
      route: '/admin/videos'
    },
    {
      icon: 'chat',
      text: 'Comments',
      route: '/admin/comments'
    },
    {
      icon: 'person',
      text: 'Users',
      route: '/admin/users'
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    public sidenavService: SidenavService,
    public courseSidenavService: CourseSidenavService
  ) {
      this.user = auth.user;
  }

  ngOnInit() {
    this.pageParams = this.route
    .queryParams
    .subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.sidenavOpened = params['login'] || false;
    });
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  public courseHeaderClick(event) {

    //console.log('course Header click');
    //console.log(this.courseSidenavService.isLoaded());

    // on the course page, toggle the content menu on small screens
    if (window.innerWidth <= 600
      && this.courseSidenavService.isLoaded()) {

      event.preventDefault();

      this.courseSidenavService.toggle();
    } else {
      this.router.navigate['/'];
    }
  }
}
