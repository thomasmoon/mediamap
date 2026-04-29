import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

export interface CommentType {
  value: number,
  viewValue: string
}

export interface Comment {
  id?: string;
  type: number;
  typeDisplay?: string;
  text: string;
  userId?: string;
  userName?: string;
  userPhoto?: string;
  videoIndex?: number;
  videoId?: string;
  videoName?: string;
  created?: number;
  updated?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private _comments = new BehaviorSubject<Comment[]>([]);
  private _commentsByUser = new BehaviorSubject<{}[]>([]);
  private dataStore: { 
    comments: Comment[],
    commentsByUser: {}[]
  } = {
    comments: [],
    commentsByUser: []
  }; // store our data in memory
  readonly comments = this._comments.asObservable();
  readonly commentsByUser = this._commentsByUser.asObservable();

  public types: CommentType[] = [
    {
      value: 0,
      viewValue: 'Comment'
    },
    {
      value: 1,
      viewValue: 'Theory'
    },
    {
      value: 2,
      viewValue: 'Reference'
    },
    {
      value: 3,
      viewValue: 'Course Material'
    },
  ];

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
  ) { }

  getComments() {
    return this._comments.asObservable();
  }

  loadAll(filters:object = null) {
    this.db.collection<Comment>('comments').valueChanges({ idField: 'id' }).subscribe(data => {     
      
      // Augment data with display fields (done here so front, ie. tables can be dumb)
      data.map(comment => {
        comment.typeDisplay = this.types[comment.type].viewValue;
        return comment;
      });

      // Filters can be passed to loadAll
      if (filters) {

        //console.log("Filter comments");

        data = data.filter(comment=>{

          // must match all filters
          let matchedFields = 0;

          for (const filter in filters) {

            //console.log(`Match by ${filter} = ${filters[filter]}`);
            
            if (comment[filter] === filters[filter]) {
              //console.log("Matched");
              matchedFields++;
            }
          }

          if (matchedFields === Object.keys(filters).length) {
            return true;
          }

          return false;
        });
      }

      // Sort by created date
      data = data.sort((a,b)=>{
        return b.created - a.created;
      });

      //console.log("Output comments to console.");
      //console.log(data);

      this.dataStore.comments = data;
      this._comments.next(Object.assign({}, this.dataStore).comments);

      let commentsByUser = {};

      // Comments by user
      data.map(comment=>{

        // Check if this comment's user exists in the list
        if (Object.keys(commentsByUser).indexOf(comment.userId) === -1) {
          
          // Create empty array if not
          commentsByUser[comment.userId] = {
            userId: comment.userId,
            userName: comment.userName,
            userPhoto: comment.userPhoto,
            comments: []
          };
        }

        // Push comment to specific user
        commentsByUser[comment.userId].comments.push(comment);
      })

      // Convert to array
      this.dataStore.commentsByUser = Object.keys(commentsByUser).map(userId=>{
        return commentsByUser[userId];
      })

      //console.log("Output commentsByUser");
      //console.log(this.dataStore.commentsByUser);

      this._commentsByUser.next(Object.assign({}, this.dataStore).commentsByUser);

    }, error => console.log('Could not load comments.'));
  }

  loadByVideo(videoId: any) {

    let filters = {
      videoId: videoId
    }

    //console.log("Load coments for video");
    //console.log(filters);

    this.loadAll(filters);
  }

  async add (data: Comment) {

    data.created = Date.now();

     // If we don't have a user then anon login
    if (!this.auth.user) {

      this.auth.anonName = data.userName;
      this.auth.loginAnon()
        .then(user=>{
          //console.log("Return from anonymous login");
          data.userId = this.auth.user.uid;
          data.userName = this.auth.user.anonName;
          data.userPhoto = this.auth.user.photoURL;

          return this.addCommit(data);
        })
        .catch(err=>{
          //console.log(err);
        })
    } else {
      data.userId = this.auth.user.uid;
      data.userName = this.auth.user.isAnonymous ? this.auth.user.anonName : this.auth.user.displayName;
      data.userPhoto = this.auth.user.photoURL;

      return this.addCommit(data);
    }
  }

  async addCommit (data: Comment) {
    try {
      await this.db.collection<Comment>('comments').add(data);
      //console.log("Comment added successfully");
    }
    catch (error) {
      //console.log("Could not add comment");
      //console.log(error);
    }
  }

  async update (data: Comment) {

    data.updated = Date.now();

    const commentRef: AngularFirestoreDocument<Comment> = this.db.doc(`comments/${data.id}`);
    try {
      await commentRef.set(data, { merge: true });
      console.log("Comment updated successfully");
    }
    catch (error) {
      console.log("Could not update comment");
      console.log(error);
    }
  }

  async delete (commentId: string) {
    const commentRef: AngularFirestoreDocument<Comment> = this.db.doc(`comments/${commentId}`);

    try {
      await commentRef.delete();
      console.log("Comment deleted successfully");
    }
    catch (error) {
      console.log("Could not delete comment");
      console.log(error);
    }
        
  }
}
