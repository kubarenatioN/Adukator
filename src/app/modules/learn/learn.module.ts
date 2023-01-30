import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from './learn.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { SharedModule } from '../shared/shared.module';
import { CreateCourseComponent } from './components/create-course/create-course.component';

@NgModule({
	declarations: [LearnComponent, CatalogComponent, CreateCourseComponent],
	imports: [CommonModule, LearnRoutingModule, SharedModule],
})
export class LearnModule {}
