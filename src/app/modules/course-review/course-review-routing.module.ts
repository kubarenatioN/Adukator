import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseReviewGuardService } from 'src/app/guards/course-review-guard.service';
import { CourseReviewComponent } from './course-review.component';

const routes: Routes = [
	{
		path: 'review/:id',
		canActivate: [CourseReviewGuardService],
		component: CourseReviewComponent,
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: '**',
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: '/app',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CourseReviewRoutingModule {}
