import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { ChartData, ChartDataset, LogarithmicScale } from 'chart.js';
import format from 'date-fns/format';
import { ModuleTopic } from 'src/app/typings/course.types';
import {
	ProfileProgress,
	ProfileProgressRecord,
} from 'src/app/typings/training.types';

type ChartDataType = ChartData<'line', number[], string>

@Component({
	selector: 'app-topics-progress-chart',
	templateUrl: './topics-progress-chart.component.html',
	styleUrls: ['./topics-progress-chart.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsProgressChartComponent implements OnInit {
	@Input()
	public progress!: ProfileProgress[];

	@Input()
	public topics!: ModuleTopic[];

    public config!: {
        data: ChartDataType,
        options?: unknown
    }
	
    constructor() {}

	ngOnInit(): void {
        this.config = this.createChartConfig(this.topics, this.progress)
        console.log(this.config);
    }

    private createChartConfig(topics: ModuleTopic[], progress: ProfileProgress[]): {
        data: ChartDataType,
        options?: unknown
    } {
        const labels = [] as string[]
        const datasets = [] as ChartDataset<'line', number[]>[]
        topics.forEach(topic => {
            const topicProgress = progress.find(progress => progress.topicId === topic.id)

            const dates = topicProgress?.records.map(record => record.date) ?? []
            labels.push(...dates)

            topic.practice?.tasks.forEach((task, i) => {
                const taskRecords = topicProgress?.records.filter(record => record.taskId === task.id)
                if (taskRecords && taskRecords.length > 0) {
                    datasets.push({
                        data: taskRecords.map(record => record.mark ?? 0) ?? [],
                        label: `${topic.title} - задание ${i + 1}`
                    })
                }
            })
        })


        return {
            data: {
                datasets,
                labels: [...new Set(labels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()))].map(timeString => format(new Date(timeString), 'dd.MM HH:mm')),
            }
        }
    }
}
