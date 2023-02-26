import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
// import {MatIconModule} from '@angular/material/icon';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		MatButtonModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatButtonToggleModule,
        // MatIconModule,
		MatFormFieldModule,
	],
	exports: [
		MatButtonModule,
		MatInputModule,
		MatDatepickerModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatButtonToggleModule,
        // MatIconModule,
		MatFormFieldModule,
	],
})
export class SharedModule {}
