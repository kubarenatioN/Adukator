import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { CourseSidenavComponent } from './components/course-sidenav/course-sidenav.component';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { TopicTrainingComponent } from './components/topic-training/topic-training.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    StudentComponent,
    CourseTrainingComponent,
    CourseSidenavComponent,
    TopicTrainingComponent
  ],
  imports: [
    CommonModule,
    LayoutComponent,
    SharedModule,
    StudentRoutingModule
  ]
})
export class StudentModule { }
