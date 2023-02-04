import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { CourseReviewComponent } from '../../components/course-review/course-review.component';
import { SharedModule } from '../shared/shared.module';
import { AdminCoursesReviewComponent } from './components/admin-courses-review/admin-courses-review.component';


@NgModule({
  declarations: [
    AdminComponent,
    CourseReviewComponent,
    AdminCoursesReviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
