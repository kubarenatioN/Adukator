import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from './learn.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { BundleOverviewComponent } from './components/bundle-overview/bundle-overview.component';
import { ValdemortModule } from 'ngx-valdemort';

@NgModule({
	providers: [FormBuilderHelper],
	declarations: [
		LearnComponent,
		CatalogComponent,
		CourseOverviewComponent,
		BundleOverviewComponent,
	],
	imports: [
		CommonModule,
		LearnRoutingModule,
		SharedModule,
		ReactiveFormsModule,
		ValdemortModule,
	],
})
export class LearnModule {}
