import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { AdminCoursesReviewComponent } from './components/admin-courses-review/admin-courses-review.component';
import { CourseReviewComponent } from './components/course-review/course-review.component';
import { CourseReviewFormComponent } from './components/course-review-form/course-review-form.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminComponent,
    AdminCoursesReviewComponent,
    CourseReviewComponent,
    CourseReviewFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    ReactiveFormsModule,
  ]
})
export class AdminModule { }
