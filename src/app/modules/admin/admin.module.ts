import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { AdminCoursesReviewComponent } from './components/admin-courses-review/admin-courses-review.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TeacherRequestsComponent } from './components/teacher-requests/teacher-requests.component';
import { TeacherPermsRequestModalComponent } from './modals/teacher-perms-request-modal/teacher-perms-request-modal.component';
import { LightgalleryModule } from 'lightgallery/angular';

@NgModule({
	declarations: [AdminComponent, AdminCoursesReviewComponent, TeacherRequestsComponent, TeacherPermsRequestModalComponent],
	imports: [
		CommonModule,
		SharedModule,
		AdminRoutingModule,
		ReactiveFormsModule,
		LightgalleryModule,
	],
})
export class AdminModule {}
