import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { AdminCoursesReviewComponent } from './components/admin-courses-review/admin-courses-review.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [AdminComponent, AdminCoursesReviewComponent],
	imports: [
		CommonModule,
		SharedModule,
		AdminRoutingModule,
		ReactiveFormsModule,
	],
})
export class AdminModule {}
