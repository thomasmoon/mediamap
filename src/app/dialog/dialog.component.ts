import {Component, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
}

/**
 * @title Dialog Overview
 */
@Component({
  selector: 'dialog-block',
  templateUrl: 'dialog-dialog.html',
  styleUrls: ['dialog-dialog.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class Dialog {

  public dialogOpen = false;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {

    this.dialogOpen = true;

    const dialogRef = this.dialog.open(Dialog, {
      width: '250px',
      height: '200px',
      data: {
        },
      panelClass: 'custom-dialog'
    });

    dialogRef.beforeClosed().subscribe(result => {
      // Video player in dialg
      //$('.camera').html($('.videoWrapper'));
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogOpen = false;
    });

    // Video player in dialog
    //$('.mat-dialog-container').html($('.videoWrapper'));
  }


  // window resize
  onResize(event){

    // Close the dialog if resizing the screen to be bigger than
    if (this.dialogOpen && event.target.innerWidth >= 600) {
      this.dialog.closeAll();
    }
  }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */