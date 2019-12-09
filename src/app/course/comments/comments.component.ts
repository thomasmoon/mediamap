import { Component, OnInit, Input, Inject, forwardRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { auth } from 'firebase';
import { AuthService } from '../../services/auth.service';
import { MatSidenav } from '@angular/material';
import { SidenavService } from '../../services/sidenav.service';
import { CommentsService, Comment, CommentType } from 'src/app/services/comments.service';
import { CourseComponent } from '../course.component';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from 'src/app/dialog/dialog.component';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  public course: any;

  //@Input() videoId: any;

  public videoId: number; 
  private videoIndex$: any;
  public videoIndex: number;
  public types: CommentType[];
  public comments: Observable<Comment[]>;
  public commentsByUser: Observable<{}[]>;

  public newComment: Comment;

  constructor(
    @Inject(forwardRef(() => CourseComponent)) course,
    public auth: AuthService,
    private sidenav: SidenavService,
    private commentsService: CommentsService,
    private route: ActivatedRoute
  ) { 

    this.course = course;

    this.initComment();

    this.videoIndex$ = this.course.videoIndexObs.subscribe(videoIndex => {

      if (videoIndex !== null) {
        this.videoIndex = videoIndex;
        this.videoId = this.course.videosFiltered[videoIndex].properties.videoId;
        this.commentsService.loadByVideo(this.videoId);
      }
    })
  }

  ngOnInit() {
    // console.log("Comments init");
    this.types = this.commentsService.types;
    this.comments = this.commentsService.comments;
    this.commentsByUser = this.commentsService.commentsByUser;
  }

  initComment() {
    this.newComment = {
      type: 0,
      text: ''
    };
  }

  addComment() {

    console.log('add comment');
    let data = this.newComment;
    console.log(data);

    if (!data.hasOwnProperty('id')) {

      console.log('Loc index');
      console.log(this.course.locIndex);

      console.log('Video id');
      console.log(this.videoId);

      console.log('Video index');
      console.log(this.videoIndex);

      console.log(this.course.videosFiltered);

      data.videoIndex = this.videoIndex;
      data.videoId = this.course.videosFiltered[this.videoIndex].properties.videoId;
      data.videoName = this.course.videosFiltered[this.videoIndex].properties.name;

      console.log('Add comment');
      this.commentsService.add(data);
    } else {

      console.log('Update comment');
      this.commentsService.update(data);
    }

    this.initComment();
  }

  editComment(comment: Comment) {

    this.newComment = comment;
  }

  deleteComment(commentId: string) {

    const dialogRef = this.course.dialog.dialog.open(Dialog, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {

      console.log('The dialog was closed');
      console.log('Result: ' + result);

      if (result === true) {
        this.commentsService.delete(commentId);
      }
    });
  }
}