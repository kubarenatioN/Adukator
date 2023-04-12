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
import { CourseTrainingService } from './services/course-training.service';
import { UploadCacheService } from 'src/app/services/upload-cache.service';
import { TrainingDataService } from './services/training-data.service';

@NgModule({
	declarations: [
		StudentComponent,
		CourseTrainingComponent,
		CourseSidenavComponent,
		TopicTrainingComponent,
		TrainingTaskComponent,
	],
	imports: [
		CommonModule,
		LayoutComponent,
		SharedModule,
		StudentRoutingModule,
		ReactiveFormsModule,
	],
	providers: [
        CourseTrainingService,
        TrainingDataService,
        UploadCacheService,
    ],
})
export class StudentModule {}
