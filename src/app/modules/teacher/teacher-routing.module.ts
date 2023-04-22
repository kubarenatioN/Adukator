import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';
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
				path: 'profile/:profileId',
                component: StudentProfileComponent
			},
			{
				path: 'check/:profileId',
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
