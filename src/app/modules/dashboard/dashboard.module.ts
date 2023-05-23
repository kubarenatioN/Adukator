import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './services/dashboard.service';
import { SharedModule } from '../shared/shared.module';
import { TrainingCompletenessChartComponent } from './charts/training-completeness-chart/training-completeness-chart.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
	declarations: [DashboardComponent, TrainingCompletenessChartComponent],
	imports: [
		CommonModule, 
		DashboardRoutingModule,
		SharedModule,
		NgChartsModule,
	],
	providers: [DashboardService],
})
export class DashboardModule {}
