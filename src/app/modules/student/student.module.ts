import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { CourseSidenavComponent } from './components/course-sidenav/course-sidenav.component';
import { CourseTrainingComponent } from './components/course-training/course-training.component';


@NgModule({
  declarations: [
    StudentComponent,
    CourseTrainingComponent,
    CourseSidenavComponent
  ],
  imports: [
    CommonModule,
    StudentRoutingModule
  ]
})
export class StudentModule { }
