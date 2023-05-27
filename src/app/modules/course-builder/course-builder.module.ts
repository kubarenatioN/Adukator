import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseBuilderRoutingModule } from './course-builder-routing.module';
import { CourseBuilderComponent } from './course-builder.component';
import { CreateCourseComponent } from './components/create-course/create-course.component';
import { CourseModuleComponent } from './components/course-module/course-module.component';
import { ModuleTopicComponent } from './components/module-topic/module-topic.component';
import { TopicTaskComponent } from './components/topic-task/topic-task.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { CourseNavComponent } from './components/course-nav/course-nav.component';
import { ChipsControlComponent } from './controls/chips-control/chips-control.component';
import { CourseBuilderService } from './services/course-builder.service';
import { UploadCacheService } from 'src/app/services/upload-cache.service';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReviewCourseComponent } from './components/review-course/review-course.component';
import { ValdemortModule } from 'ngx-valdemort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
	providers: [
		CourseBuilderService, 
		UploadCacheService,
	],
	declarations: [
		CourseBuilderComponent,
		CourseFormComponent,
		CreateCourseComponent,
		CourseModuleComponent,
		ModuleTopicComponent,
		TopicTaskComponent,
		CourseNavComponent,
		ChipsControlComponent,
		ReviewCourseComponent,
	],
	imports: [
		CommonModule,
		CourseBuilderRoutingModule,
		SharedModule,
		ValdemortModule,

		MatAutocompleteModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,
		LayoutComponent,
	],
})
export class CourseBuilderModule {}
