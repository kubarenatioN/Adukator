import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { SharedModule } from '../shared/shared.module';
import { UserPageComponent } from './components/user-page/user-page.component';
import { BecomeTeacherModalComponent } from './modals/become-teacher-modal/become-teacher-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
	declarations: [UserProfileComponent, UserPageComponent, BecomeTeacherModalComponent],
	imports: [CommonModule, SharedModule, UserProfileRoutingModule, ReactiveFormsModule, MatDialogModule],
})
export class UserProfileModule {}
