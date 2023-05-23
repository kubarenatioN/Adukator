import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';

type Dataset = { x: string; y: number };
type ChartDataType = ChartData<'line', Dataset[], string>;

@Component({
	selector: 'app-topics-progress-chart',
	templateUrl: './topics-progress-chart.component.html',
	styleUrls: ['./topics-progress-chart.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsProgressChartComponent implements OnInit {
	@Input()
	public config!: ChartConfiguration<'line', Dataset[], string>;

	constructor() {}

	ngOnInit(): void {

	}
}
