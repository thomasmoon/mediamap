import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SidenavService } from '../../services/sidenav.service';
import { CommentsService, Comment, CommentType } from 'src/app/services/comments.service';
import { CourseComponent } from '../course.component';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from 'src/app/dialog/dialog.component';


@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.scss'],
    standalone: false
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
    private sidenavService: SidenavService,
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

    let data = this.newComment;

    if (!data.hasOwnProperty('id')) {
      // add
      data.videoIndex = this.videoIndex;
      data.videoId = this.course.videosFiltered[this.videoIndex].properties.videoId;
      data.videoName = this.course.videosFiltered[this.videoIndex].properties.name;
      this.commentsService.add(data);
    } else {
      // update
      this.commentsService.update(data);
    }

    this.initComment();
  }

  editComment(comment: Comment) {

    this.newComment = comment;
  }

  cancelEdit() {
    this.initComment();
  }

  deleteComment(commentId: string) {

    const dialogRef = this.course.dialog.dialog.open(Dialog, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.commentsService.delete(commentId);
      }
    });
  }

  public login() {
    this.sidenavService.open();
  }
}
