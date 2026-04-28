'use strict';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router'; // ActivatedRouteSnapshot, RouterStateSnapshot,
import { AuthService, MoocUser } from './auth.service';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AuthGuard  {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    // next: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    return this.auth.getUser().pipe(
      map((user: MoocUser) => {
        if (user) {
          return true;
        } else {   
          this.auth.redirectLogin();
        }
      }),
      catchError((err) => {
        this.auth.redirectLogin();
        return of(false);
      })
    );
  }
}
