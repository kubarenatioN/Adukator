import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js';
import { format } from 'date-fns';
import { ModuleTopic } from '../typings/course.types';
import {
	PersonalTask,
	ProfileProgress,
	ProfileProgressRecord,
	ProfileProgressRecordDashboard,
	ProfileProgressTraining,
} from '../typings/training.types';
import { formatTopicsDeadlines } from '../modules/student/helpers/course-training.helper';

type Dataset = { x: string; y: number };
type ChartDataType = ChartData<'line', Dataset[], string>;

export const createTopicsProgressConfig = (
	topics: ModuleTopic[],
	progress: ProfileProgress[],
	personalTasks?: PersonalTask[]
): ChartConfiguration<'line', Dataset[], string> => {
	const labels = [] as string[];
	const datasets = [] as ChartDataset<'line', Dataset[]>[];

	const topicProgress = progress.reduce((acc, profile) => {
		acc.push(...profile.records);
		return acc;
	}, [] as ProfileProgressRecord[]);

	const dates = topicProgress.map((record) => record.date) ?? [];
	labels.push(...new Set(dates));

	topics.forEach((topic) => {
		let topicTaskCounter = 0;
		topic.practice?.tasks.forEach((task, i) => {
			topicTaskCounter++;
			const taskRecords = topicProgress.filter(
				(record) => record.taskId === task.id
			);
			if (taskRecords && taskRecords.length > 0) {
				datasets.push({
					data: taskRecords.map((record) => {
						return {
							x: format(new Date(record.date), 'dd.MM HH:mm'),
							y: record.mark ?? 0,
						};
					}),
					label: `${topic.title} - задание ${topicTaskCounter}`,
				});
			}
		});
		const topicPersonalTasks = personalTasks?.filter(
			(task) => task.topicId === topic.id
		);
		if (topicPersonalTasks && topicPersonalTasks.length > 0) {
			topicPersonalTasks.forEach((personal) => {
				topicTaskCounter++;
				const taskRecords = topicProgress.filter(
					(record) => record.taskId === personal.task.id
				);
				datasets.push({
					data: taskRecords.map((record) => {
						return {
							x: format(new Date(record.date), 'dd.MM HH:mm'),
							y: record.mark ?? 0,
						};
					}),
					label: `${topic.title} - задание ${topicTaskCounter}`,
				});
			});
		}
	});

	const formattedLabels = labels
		.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
		.map((timeString) => format(new Date(timeString), 'dd.MM HH:mm'));
	return {
		type: 'line',
		data: {
			datasets,
			labels: formattedLabels,
		},
	};
};

export module DashboardCharts {

	export const getTrainingProgressChartConfig = (topicsProgress: ProfileProgressTraining[]) => {
		const progressRecords = topicsProgress
			.map(topicProgress => {
				const training = topicProgress.profile?.training;
				if (!training) {
					return null
				}

				const topics = formatTopicsDeadlines(training.course.topics, training)
				const topicId = topicProgress.topicId
				const topic = topics.find(t => t.id === topicId)

				const records = topicProgress.records

				return {
					id: topicProgress.uuid,
					topic,
					isPast: topic?.isPast,
					isActual: topic?.isActual,
					records: records
						.sort((a, b) => {
							return new Date(b.date).getTime() - new Date(a.date).getTime()
						})
						.reduce((unique, rec) => {
							if (!unique.some(it => it.taskId === rec.taskId)) {
								unique.push({
									...rec,
									isDone: rec.isCounted === true,
									isOverdue: Boolean(!rec.isCounted && topic?.isPast),
									isComing: !topic?.isActual && !topic?.isPast,
									isCurrent: Boolean(topic?.isActual && !rec.isCounted),
								})
							}
							return unique
						}, [] as ProfileProgressRecordDashboard[])
				}
			})
		
		const allTrainingTasks: ProfileProgressRecordDashboard[] = []
		progressRecords.forEach(topicProgress => {
			if (topicProgress) {
				allTrainingTasks.push(...topicProgress.records)
			}
		})

		if (allTrainingTasks.length === 0) {
			return null
		}

		let current = 0;
		let done = 0;
		let overdue = 0;
		let coming = 0;

		allTrainingTasks.forEach(t => {
			current += Number(t.isCurrent)
			done += Number(t.isDone)
			overdue += Number(t.isOverdue)
			coming += Number(t.isComing)
		})
		
		const labels: string[] = ['Current', 'Done', 'Overdue', 'Coming'];
		const data: ChartConfiguration<'doughnut', number[], string>['data'] = {
			datasets: [
				{
					data: [current, done, overdue, coming],
				}
			],
			labels,
		}

		const config: ChartConfiguration<'doughnut', number[], string> = {
			data,
			type: 'doughnut',
		}
		
		return config
	}

}

function partition(array: any[], isValid: (item: any) => boolean) {
	return array.reduce(([pass, fail], elem) => {
	  	return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
	}, [[], []]);
}
