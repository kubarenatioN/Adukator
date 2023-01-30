import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { CreateCourseComponent } from './components/create-course/create-course.component';

const routes: Routes = [
	{ path: '', component: CatalogComponent },
	{
		path: 'create',
		component: CreateCourseComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class LearnRoutingModule {}
