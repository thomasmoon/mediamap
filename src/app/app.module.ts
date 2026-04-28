// Environment
import { environment } from '../environments/environment';

// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

// Material Design
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';

// Routes
import { AppRoutingModule } from './app-routing.module';

// Auth Service & Guards
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';

// Other Services
import { MapService } from './services/map.service';
import { SidenavService } from './services/sidenav.service';
import { CourseSidenavService } from './services/coursesidenav.service';

// Components
import { AppComponent } from './app.component';

// Shared Components
import { TableComponent } from './shared/table/table.component';
import { Dialog } from './dialog/dialog.component';
import { MediaToolsComponent } from './media-tools/media-tools.component';

// Course Components
import { CourseComponent } from './course/course.component';
import { MapComponent } from './course/map/map.component';
import { ContentComponent } from './course/content/content.component';
import { ToolsComponent } from './course/tools/tools.component';
import { VideoComponent } from './course/video/video.component';
import { CommentsComponent } from './course/comments/comments.component';

// Admin Components
import { VideosComponent } from './admin/videos/videos.component';
import { CommentsAdminComponent } from './admin/comments/comments.component';

// Other Components
import { PrivacyComponent } from './privacy/privacy.component';
import { LessonComponent } from './lesson/lesson.component';

// Application Module
@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    Dialog,
    MediaToolsComponent,
    ContentComponent,
    ToolsComponent,
    CourseComponent,
    VideoComponent,
    CommentsComponent,
    VideosComponent,
    CommentsAdminComponent,
    TableComponent,
    PrivacyComponent,
    LessonComponent
  ],
  imports: [
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'angular-auth-firebase'),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatOptionModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatDialogModule,
    MatTabsModule,
    MatCheckboxModule
  ],
  providers: [
    AuthService,
    MapService,
    SidenavService,
    CourseSidenavService,
    AngularFirestore,
    AuthGuard,
    AdminGuard,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: [] }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
