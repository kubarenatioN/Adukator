import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { SharedModule } from '../shared/shared.module';
import { CourseMemberComponent } from './components/course-member/course-member.component';
import { TrainingCheckComponent } from './components/training-check/training-check.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadCacheService } from 'src/app/services/upload-cache.service';
import { TrainingTaskResultComponent } from './components/training-task-result/training-task-result.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';
import { TrainingPersonalizationComponent } from './components/training-personalization/training-personalization.component';
import { PersonalTasksComponent } from './components/personal-tasks/personal-tasks.component';
import { AssignTaskComponent } from './components/personalization/assign-task/assign-task.component';
import { DismissTaskComponent } from './components/personalization/dismiss-task/dismiss-task.component';
import { OpenTaskComponent } from './components/personalization/open-task/open-task.component';
import { StartTrainingSubmitComponent } from './modals/start-training-submit/start-training-submit.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ValdemortModule } from 'ngx-valdemort';

@NgModule({
	providers: [UploadCacheService],
	declarations: [
		TeacherComponent,
		CourseManagementComponent,
		CourseMemberComponent,
		TrainingCheckComponent,
		TrainingTaskResultComponent,
		StudentProfileComponent,
		TrainingPersonalizationComponent,
		PersonalTasksComponent,
		AssignTaskComponent,
		DismissTaskComponent,
		OpenTaskComponent,
		StartTrainingSubmitComponent,
	],
	imports: [
		CommonModule,
		TeacherRoutingModule,
		ReactiveFormsModule,
		MatDialogModule,
		SharedModule,
		ValdemortModule,
	],
})
export class TeacherModule {}
