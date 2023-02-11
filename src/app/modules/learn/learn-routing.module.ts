import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { CreateCourseComponent } from './components/create-course/create-course.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'catalog',
		pathMatch: 'full',
	},
	{
		path: 'catalog',
		component: CatalogComponent,
	},
	{
		path: 'create',
		component: CreateCourseComponent,
	},
	{
		path: 'course',
		children: [
			{
				path: 'training/:id',
				component: CourseTrainingComponent,
			},
			{
				path: 'overview/:id',
				component: CourseOverviewComponent,
			},
			{
				path: 'review/:id',
				component: CourseOverviewComponent,
			},
		],
	},
	{
		path: '**',
		redirectTo: 'catalog',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class LearnRoutingModule {}
