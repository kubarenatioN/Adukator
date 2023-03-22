import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CourseReviewComponent } from './components/course-review/course-review.component';

const routes: Routes = [
	{ path: 'review/:id', component: CourseReviewComponent },
	{ path: '', component: AdminComponent },
	{ path: '**', redirectTo: '' },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdminRoutingModule {}
