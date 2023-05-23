import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';

@Component({
  selector: 'app-training-completeness-chart',
  templateUrl: './training-completeness-chart.component.html',
  styleUrls: ['./training-completeness-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingCompletenessChartComponent implements OnInit {
  @Input() config!: {
    data: ChartData,
  }
  constructor() { }

  ngOnInit(): void {
  }

}
