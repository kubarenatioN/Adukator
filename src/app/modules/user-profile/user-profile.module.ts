import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { SharedModule } from '../shared/shared.module';
import { UserPageComponent } from './components/user-page/user-page.component';
import { BecomeTeacherModalComponent } from './modals/become-teacher-modal/become-teacher-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { UploadCacheService } from 'src/app/services/upload-cache.service';
import { RequestCompetenciesModalComponent } from './modals/request-competencies-modal/request-competencies-modal.component';

@NgModule({
	declarations: [UserProfileComponent, UserPageComponent, BecomeTeacherModalComponent, RequestCompetenciesModalComponent],
	imports: [CommonModule, SharedModule, UserProfileRoutingModule, ReactiveFormsModule, MatDialogModule],
	providers: [
		UploadCacheService,
	]
})
export class UserProfileModule {}
