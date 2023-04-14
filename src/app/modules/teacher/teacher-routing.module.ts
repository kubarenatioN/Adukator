import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { TrainingCheckComponent } from './components/training-check/training-check.component';
import { TeacherComponent } from './teacher.component';

const routes: Routes = [
	{
		path: '',
		component: TeacherComponent,
	},
	{
		path: 'training/:id',
		children: [
			{
				path: 'manage',
                component: CourseManagementComponent
			},
			{
				path: 'check/:studentId',
                component: TrainingCheckComponent
			},
			{
				path: 'check',
                component: TrainingCheckComponent
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class TeacherRoutingModule {}
