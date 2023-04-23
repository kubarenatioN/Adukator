import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { CourseSidenavComponent } from './components/course-sidenav/course-sidenav.component';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { TopicTrainingComponent } from './components/topic-training/topic-training.component';
import { SharedModule } from '../shared/shared.module';
import { TrainingTaskComponent } from './components/training-task/training-task.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadCacheService } from 'src/app/services/upload-cache.service';
import { StudentTrainingService } from './services/student-training.service';
// import { CourseTrainingGuardService } from './guards/course-training-guard.service';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';
import { StudentProfileService } from './services/student-profile.service';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
	declarations: [
		StudentComponent,
		CourseTrainingComponent,
		CourseSidenavComponent,
		TopicTrainingComponent,
		TrainingTaskComponent,
        StudentProfileComponent	
    ],
	imports: [
		CommonModule,
		LayoutComponent,
		SharedModule,
		StudentRoutingModule,
		ReactiveFormsModule,
        NgChartsModule,
    ],
	providers: [
        StudentTrainingService,
        StudentProfileService,
        // CourseTrainingGuardService,
        UploadCacheService,
    ],
})
export class StudentModule {}
