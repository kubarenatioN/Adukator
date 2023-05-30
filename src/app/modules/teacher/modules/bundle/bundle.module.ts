import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BundleRoutingModule } from './bundle-routing.module';
import { BundleComponent } from './bundle.component';
import { CreateComponent } from './create/create.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BundleService } from './services/bundle.service';
import { BundleItemComponent } from './bundle-item/bundle-item.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ValdemortModule } from 'ngx-valdemort';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
	declarations: [BundleComponent, CreateComponent, BundleItemComponent],
	imports: [
		CommonModule,
		BundleRoutingModule,
		ReactiveFormsModule,
		SharedModule,
		LayoutComponent,
		ValdemortModule,
	],
	providers: [BundleService],
})
export class BundleModule {}
