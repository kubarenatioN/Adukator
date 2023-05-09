import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { PersonalTasksComponent } from './components/personal-tasks/personal-tasks.component';
import { AssignTaskComponent } from './components/personalization/assign-task/assign-task.component';
import { DismissTaskComponent } from './components/personalization/dismiss-task/dismiss-task.component';
import { OpenTaskComponent } from './components/personalization/open-task/open-task.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';
import { TrainingCheckComponent } from './components/training-check/training-check.component';
import { TrainingPersonalizationComponent } from './components/training-personalization/training-personalization.component';
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
				component: CourseManagementComponent,
			},
			{
				path: 'check/:profileId',
				component: TrainingCheckComponent,
			},
			{
				path: 'check',
				component: TrainingCheckComponent,
			},
		],
	},
	{
		path: 'profile',
		component: StudentProfileComponent,
	},
	{
		path: 'personalization',
		children: [
			{
				path: 'tasks',
				component: PersonalTasksComponent,
			},
			{
				path: '',
				component: TrainingPersonalizationComponent,
				children: [
					{
						path: 'assign',
						component: AssignTaskComponent,
					},
					{
						path: 'open',
						component: OpenTaskComponent,
					},
				],
			},
		],
	},
	{
		path: 'bundle',
		loadChildren: () =>
			import('./modules/bundle/bundle.module').then(
				(m) => m.BundleModule
			),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class TeacherRoutingModule {}
