import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BackBtnComponent } from 'src/app/modules/shared/components/back-btn/back-btn.component';
import { DatePipe } from 'src/app/pipes/date.pipe';
import { TimeDurationPipe } from 'src/app/pipes/time-duration.pipe';
import { UploadBoxComponent } from 'src/app/components/upload-box/upload-box.component';
import { DndDirective } from 'src/app/directives/dnd.directive';
import { FormElementReviewWrapperComponent } from 'src/app/components/form-element-review-wrapper/form-element-review-wrapper.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		BackBtnComponent,
		DatePipe,
		TimeDurationPipe,
		UploadBoxComponent,
		DndDirective,
        FormElementReviewWrapperComponent,
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
		BackBtnComponent,
		DatePipe,
		TimeDurationPipe,
		UploadBoxComponent,
		DndDirective,
        FormElementReviewWrapperComponent,
	],
})
export class SharedModule {}
