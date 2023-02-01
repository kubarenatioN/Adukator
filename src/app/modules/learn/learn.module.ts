import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from './learn.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { SharedModule } from '../shared/shared.module';
import { CreateCourseComponent } from './components/create-course/create-course.component';
import { CourseModuleComponent } from './components/course-module/course-module.component';
import { ReactiveFormsModule } from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ModuleTopicComponent } from './components/module-topic/module-topic.component';
import { CreateTopicDialogComponent } from './components/create-topic-dialog/create-topic-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
	declarations: [LearnComponent, CatalogComponent, CreateCourseComponent, CourseModuleComponent, ModuleTopicComponent, CreateTopicDialogComponent],
	imports: [CommonModule, LearnRoutingModule, SharedModule, ReactiveFormsModule, DragDropModule, MatDialogModule],
})
export class LearnModule {}
