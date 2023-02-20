import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from './learn.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { SharedModule } from '../shared/shared.module';
import { CreateCourseComponent } from './components/create-course/create-course.component';
import { CourseModuleComponent } from './components/course-module/course-module.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModuleTopicComponent } from './components/module-topic/module-topic.component';
import { CreateTopicDialogComponent } from './components/create-topic-dialog/create-topic-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { CourseReviewDiffComponent } from './components/course-review-diff/course-review-diff.component';
import { CourseReviewComponent } from './components/course-review/course-review.component';

@NgModule({
	declarations: [
		LearnComponent,
		CatalogComponent,
		CreateCourseComponent,
		CourseModuleComponent,
		ModuleTopicComponent,
		CreateTopicDialogComponent,
		CourseOverviewComponent,
		CourseTrainingComponent,
		CourseFormComponent,
		CourseReviewDiffComponent,
		CourseReviewComponent,
	],
	imports: [
		CommonModule,
		LearnRoutingModule,
		SharedModule,
		ReactiveFormsModule,
		DragDropModule,
		MatDialogModule,
	],
})
export class LearnModule {}