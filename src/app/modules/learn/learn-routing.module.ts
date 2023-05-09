import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { BundleOverviewComponent } from './components/bundle-overview/bundle-overview.component';

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
		path: 'overview',
		children: [
			{
				path: 'course/:id',
				component: CourseOverviewComponent,
			},
			{
				path: 'bundle/:id',
				component: BundleOverviewComponent,
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
