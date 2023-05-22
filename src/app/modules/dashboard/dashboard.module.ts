import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { TrainingService } from './services/training.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [DashboardComponent],
	imports: [CommonModule, DashboardRoutingModule, SharedModule],
	providers: [TrainingService],
})
export class DashboardModule {}
