import { Component, OnInit, ViewChild } from '@angular/core';
import { CommentsService, Comment} from 'src/app/services/comments.service';
import { MatPaginator } from '@angular/material/paginator';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-comments-admin',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsAdminComponent implements OnInit {

  public columns: string[] = ['userName', 'videoId', 'typeDisplay', 'text'];
  public columnLabels: string[] = ['User', 'Video', 'Type', 'Comment'];

  public comments: any;

  constructor(
    private commentsService: CommentsService
  ) { }

  ngOnInit() {

    // subscribe to entire collection
    this.comments = this.commentsService.comments;
    this.commentsService.loadAll();
  }

}
