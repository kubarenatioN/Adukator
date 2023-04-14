import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { SharedModule } from '../shared/shared.module';
import { CourseMemberComponent } from './components/course-member/course-member.component';
import { TrainingCheckComponent } from './components/training-check/training-check.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	providers: [],
	declarations: [
		TeacherComponent,
		CourseManagementComponent,
		CourseMemberComponent,
		TrainingCheckComponent,
	],
	imports: [
        CommonModule, 
        TeacherRoutingModule, 
        ReactiveFormsModule,
        SharedModule
    ],
})
export class TeacherModule {}
