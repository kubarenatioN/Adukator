import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BackBtnComponent } from 'src/app/modules/shared/components/back-btn/back-btn.component';
import { DatePipe } from 'src/app/pipes/date.pipe';
import { TimeDurationPipe } from 'src/app/pipes/time-duration.pipe';
import { UploadBoxComponent } from 'src/app/components/upload-box/upload-box.component';
import { DndDirective } from 'src/app/directives/dnd.directive';
import { FormElementReviewWrapperComponent } from 'src/app/components/form-element-review-wrapper/form-element-review-wrapper.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormElementWrapperDirective } from 'src/app/directives/form-element-wrapper.directive';
import { FileItemComponent } from 'src/app/components/upload-box/components/file-item/file-item.component';
import { TopicsProgressChartComponent } from './charts/topics-progress-chart/topics-progress-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { GroupingUploadBoxComponent } from 'src/app/components/upload-box/grouping-upload-box/grouping-upload-box.component';
import { CourseDurationPipe } from 'src/app/pipes/course-duration.pipe';
import { CourseStatusPipe } from 'src/app/pipes/course-status.pipe';
import { SortStudentTrainingPipe } from 'src/app/pipes/sort-student-training.pipe';
import { CompetencyPipe } from 'src/app/pipes/competency.pipe';

@NgModule({
	declarations: [
		BackBtnComponent,
		DatePipe,
		TimeDurationPipe,
		UploadBoxComponent,
		GroupingUploadBoxComponent,
		FileItemComponent,
		DndDirective,
		FormElementWrapperDirective,
		FormElementReviewWrapperComponent,
		TopicsProgressChartComponent,
		CourseDurationPipe,
		CourseStatusPipe,
		SortStudentTrainingPipe,
		CompetencyPipe,
	],
	imports: [
		CommonModule,
		MatButtonModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatExpansionModule,
		MatCheckboxModule,
		MatSelectModule,
		MatButtonToggleModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatChipsModule,
		NgChartsModule,
		MatIconModule,
	],
	exports: [
		MatButtonModule,
		MatInputModule,
		MatDatepickerModule,
		MatExpansionModule,
		MatCheckboxModule,
		MatSelectModule,
		MatButtonToggleModule,
		MatFormFieldModule,
		MatIconModule,
		MatChipsModule,
		BackBtnComponent,
		DatePipe,
		TimeDurationPipe,
		UploadBoxComponent,
		GroupingUploadBoxComponent,
		FileItemComponent,
		DndDirective,
		FormElementWrapperDirective,
		FormElementReviewWrapperComponent,
		TopicsProgressChartComponent,
		CourseDurationPipe,
		CourseStatusPipe,
		SortStudentTrainingPipe,
		CompetencyPipe,
	],
})
export class SharedModule {}
