import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';

const routes: Routes = [
	{
		path: 'profile/:id/training',
		component: CourseTrainingComponent,
	},
	{
		path: 'profile/:id',
		component: StudentProfileComponent,
	},
	{
		path: 'profile',
		component: StudentProfileComponent,
	},
	{
		path: '**',
		redirectTo: '/app/learn/catalog',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class StudentRoutingModule {}
