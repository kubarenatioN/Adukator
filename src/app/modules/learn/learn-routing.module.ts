import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';

const routes: Routes = [
    {
		path: 'catalog',
		component: CatalogComponent,
	},
	{
		path: '',
		redirectTo: 'catalog',
		pathMatch: 'full',
	},
	{
		path: 'course',
		children: [
			{
				path: 'overview/:id',
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
