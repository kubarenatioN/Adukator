import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { SharedModule } from '../shared/shared.module';
import { CourseMemberComponent } from './components/course-member/course-member.component';
import { CourseTopicCheckComponent } from './components/course-topic-check/course-topic-check.component';

@NgModule({
	providers: [],
	declarations: [
		TeacherComponent,
		CourseManagementComponent,
		CourseMemberComponent,
		CourseTopicCheckComponent,
	],
	imports: [CommonModule, TeacherRoutingModule, SharedModule],
})
export class TeacherModule {}
