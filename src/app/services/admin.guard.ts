import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, MoocUser } from './auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AdminGuard  {

  constructor(public auth: AuthService, public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {

    //console.log('Auth guard admin.');

    return this.auth.getUser().pipe(
      map((user: MoocUser) => {

        //console.log('Got user');
        //console.log(user);

        if (user && user.isAdmin) {

          //console.log('User is admin, allowed');
          return true;

        } else {   

          //console.log('User is not admin, redirect');
          this.auth.redirectLogin();
        }
      }),
      catchError((err) => {

        console.log('Error getting user');
        console.error(err);

        this.auth.redirectLogin();
        return of(false);
      })
    );
  }
}
