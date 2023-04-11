import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { CourseTopicCheckComponent } from './components/course-topic-check/course-topic-check.component';
import { TeacherComponent } from './teacher.component';

const routes: Routes = [
	{
		path: '',
		component: TeacherComponent,
	},
	{
		path: 'course/:id',
		children: [
			{
				path: 'manage',
                component: CourseManagementComponent
			},
			{
				path: 'check/:studentId',
                component: CourseTopicCheckComponent
			},
			{
				path: 'check',
                component: CourseTopicCheckComponent
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class TeacherRoutingModule {}
