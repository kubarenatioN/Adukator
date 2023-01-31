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

@NgModule({
	declarations: [LearnComponent, CatalogComponent, CreateCourseComponent, CourseModuleComponent],
	imports: [CommonModule, LearnRoutingModule, SharedModule, ReactiveFormsModule, DragDropModule],
})
export class LearnModule {}
