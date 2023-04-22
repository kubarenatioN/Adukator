import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import {
	ProfileProgress,
	ProfileProgressRecord,
} from 'src/app/typings/training.types';

@Component({
	selector: 'app-progress-chart',
	templateUrl: './progress-chart.component.html',
	styleUrls: ['./progress-chart.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressChartComponent implements OnInit {
	@Input()
	public progress!: ProfileProgress;
	constructor() {}

	ngOnInit(): void {}
}
