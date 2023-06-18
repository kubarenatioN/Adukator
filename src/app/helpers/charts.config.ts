import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js';
import { format } from 'date-fns';
import { CourseModule, ModuleTopic, TopicTask } from '../typings/course.types';
import {
	PersonalTask,
	Personalization,
	ProfileProgress,
	ProfileProgressRecord,
	ProfileProgressRecordDashboard,
	ProfileProgressTraining,
	Training,
	TrainingProfileFull,
	TrainingProfileTraining,
} from '../typings/training.types';
import { formatTopicsDeadlines } from '../modules/student/helpers/course-training.helper';
import { chartsColorsPallete, chartsColorsPalleteBright, chartsColorsPalleteDark } from '../constants/common.constants';

const modulesProgressMock = {
	'FpuM5CmKzq_6nwbTuKYfQ': [
		{
			"uuid": "L-iXzrWOzEjlUrUbCmtm3",
			"taskId": "9Ch2s-ZBguGJrxzlJS5mR",
			"mark": 55,
			"isCounted": true,
			"date": "Sun, 04 Jun 2023 13:42:54 GMT",
			"_id": "647c94de3393a3b79dca84f8"
		},
		{
			"uuid": "ZJwH50kmRj2XaLzbbyaoM",
			"taskId": "NwlpSA2haDeF5WOwgFztV",
			"mark": 15,
			"isCounted": false,
			"date": "Sun, 04 Jun 2023 13:35:23 GMT",
			"_id": "647c931b3393a3b79dca8001"
		},
		{
			"uuid": "kjuZJQ19YYa-_JvA3eHSe",
			"taskId": "jzBhi3WxzU3XJKVSw-sVK",
			"mark": 60,
			"isCounted": true,
			"date": "Tue, 30 May 2023 05:11:51 GMT",
			"_id": "647585976289f2e39604e454"
		},
		{
			"uuid": "A4NIPHvGHinLqMnE7LjNx",
			"taskId": "D1K4CZ5dfVygfTPwzXsFj",
			"mark": 75,
			"isCounted": false,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f54d"
		},
		{
			"uuid": "Z6hg_g5a3YR0_GVpFVrME",
			"taskId": "RyA2AziNn5VHi4LpRJSwm",
			"mark": 85,
			"isCounted": false,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f54e"
		},
		{
			"uuid": "nBfj83SGGNfyIMEm5lhz8",
			"taskId": "zvlZMYrp-Wpi_eBNU8Nq1",
			"mark": 55,
			"isCounted": true,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f54f"
		},
		{
			"uuid": "W2AwnjOgXB-jINv_v54U1",
			"taskId": "406dVwBfj7zz6-9hJHb31",
			"mark": 0,
			"isCounted": false,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f550"
		}
	],
	'FpuM5CmKzq_6nwbTuKYfD': [
		{
			"uuid": "L-iXzrWOzEjlUrUbCmtm3",
			"taskId": "9Ch2s-ZBguGJrxzlJS5mR",
			"mark": 15,
			"isCounted": true,
			"date": "Sun, 04 Jun 2023 13:42:54 GMT",
			"_id": "647c94de3393a3b79dca84f8"
		},
		{
			"uuid": "ZJwH50kmRj2XaLzbbyaoM",
			"taskId": "NwlpSA2haDeF5WOwgFztV",
			"mark": 35,
			"isCounted": false,
			"date": "Sun, 04 Jun 2023 13:35:23 GMT",
			"_id": "647c931b3393a3b79dca8001"
		},
		{
			"uuid": "kjuZJQ19YYa-_JvA3eHSe",
			"taskId": "jzBhi3WxzU3XJKVSw-sVK",
			"mark": 70,
			"isCounted": true,
			"date": "Tue, 30 May 2023 05:11:51 GMT",
			"_id": "647585976289f2e39604e454"
		},
		{
			"uuid": "A4NIPHvGHinLqMnE7LjNx",
			"taskId": "D1K4CZ5dfVygfTPwzXsFj",
			"mark": 45,
			"isCounted": false,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f54d"
		},
		{
			"uuid": "Z6hg_g5a3YR0_GVpFVrME",
			"taskId": "RyA2AziNn5VHi4LpRJSwm",
			"mark": 95,
			"isCounted": false,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f54e"
		},
		{
			"uuid": "nBfj83SGGNfyIMEm5lhz8",
			"taskId": "zvlZMYrp-Wpi_eBNU8Nq1",
			"mark": 25,
			"isCounted": true,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f54f"
		},
		{
			"uuid": "W2AwnjOgXB-jINv_v54U1",
			"taskId": "406dVwBfj7zz6-9hJHb31",
			"mark": 10,
			"isCounted": false,
			"date": "Wed, 24 May 2023 19:38:18 GMT",
			"_id": "646e67aab9bd3a5c6922f550"
		}
	]
}


export const createTopicsProgressConfig = (
	data: {
		profile: TrainingProfileFull | null;
		progress?: ProfileProgress[];
		personalization?: Personalization[];
	}[]
): ChartConfiguration<'bar', number[], string> => {
	let label = ''
	if (data) {
		label = data[0]?.profile?.training.course.title ?? ''
	}
	const datasets = [] as ChartDataset<'bar', number[]>[];

	console.log(data);
	
	data.forEach((item, i) => {
		const { progress, profile, personalization } = item

		const profileScore = profile?.lastScore ?? 0
		datasets.push({
			data: [profileScore],
			label: profile?.student.username,
			backgroundColor: chartsColorsPallete[i],
			hoverBackgroundColor: chartsColorsPalleteBright[i],
			borderColor: chartsColorsPallete[i],
			hoverBorderColor: chartsColorsPalleteDark[i],
		})
	})

	console.log(datasets);	

	return {
		type: 'bar',
		data: {
			datasets,
			labels: [label],
		},
	};
};

export module DashboardCharts {

	export const getTrainingProgressChartConfig = (topicsProgress: ProfileProgressTraining[]) => {
		const progressRecords = topicsProgress
			.map((topicProgress) => {
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
					backgroundColor: [
						chartsColorsPallete[0],
						chartsColorsPallete[1],
						chartsColorsPallete[2],
						chartsColorsPallete[3],
					],
					hoverBorderColor: [
						chartsColorsPalleteDark[0],
						chartsColorsPalleteDark[1],
						chartsColorsPalleteDark[2],
						chartsColorsPalleteDark[3],
					],
					hoverBackgroundColor: [
						chartsColorsPalleteBright[0],
						chartsColorsPalleteBright[1],
						chartsColorsPalleteBright[2],
						chartsColorsPalleteBright[3],
					]
				}
			],
			labels,
		}

		const config: any = {
			data,
			type: 'doughnut',
		}
		
		return config
	}

}

export module StudentCharts {

	export const moduleProgress = (training: Training, progress: ProfileProgress[]) => {
		const { modules, topics } = training.course

		let tasksByModules = progress.reduce((acc, task) => {
			const moduleId = topics.find(t => t.id === task.topicId)?.moduleId
			if (moduleId) {
				if (acc[moduleId]) {
					acc[moduleId].push(...task.records)
				}

				if (!acc[moduleId]) {
					acc[moduleId] = [...task.records]
				}
			}

			return acc;
		}, {} as { [key: string]: Array<ProfileProgressRecord> })
		
		const modulesIds = Object.keys(tasksByModules)
		modulesIds.forEach(key => {
			tasksByModules[key] = getTopicRecordsLastResult(tasksByModules[key] ?? [])
		})
		
		const maxTasksInModule = Object.keys(tasksByModules).reduce((acc, key) => {
			if (tasksByModules[key].length > acc) {
				return tasksByModules[key].length
			}
			return acc
		}, 0)
		
		const labels = modulesIds.map(moduleId => modules.find(m => m.id === moduleId)?.title ?? moduleId)

		const data: ChartData<'bar', number[]> = {
			labels,
			datasets: [
				{
					data: modulesIds.map(mId => tasksByModules[mId].reduce((acc, t) => acc + t.mark, 0)),
					label: 'Текущий балл по модулю',
					backgroundColor: chartsColorsPallete[0],
					hoverBackgroundColor: chartsColorsPalleteBright[0],
					hoverBorderColor: chartsColorsPalleteDark[0],
				},
				{
					data: modulesIds.map(mId => tasksByModules[mId].reduce((acc, t) => acc + 100, 0)),
					label: 'Максимальный балл',
					backgroundColor: chartsColorsPallete[1],
					hoverBackgroundColor: chartsColorsPalleteBright[1],
					hoverBorderColor: chartsColorsPalleteDark[1],
				}
			]
		}

		const config: ChartConfiguration<'bar', number[]> = {
			type: 'bar',
			data,
		}
		return { config }
	}

	export const moduleTimeProgress = (training: Training, progress: ProfileProgress[]) => {
		const { modules, topics } = training.course

		const tasksByTopics = progress.reduce((acc, task) => {
			const topicId = topics.find(t => t.id === task.topicId)?.id
			if (topicId) {
				if (acc[topicId]) {
					acc[topicId].push(...task.records)
				}

				if (!acc[topicId]) {
					acc[topicId] = [...task.records]
				}
			}

			return acc;
		}, {} as { [key: string]: Array<ProfileProgressRecord> })

		console.log(tasksByTopics);

		const topicsIds = Object.keys(tasksByTopics)
		topicsIds.forEach(key => {
			tasksByTopics[key] = getTopicRecordsLastResult(tasksByTopics[key] ?? [])
		})

		const topicsResults = topicsIds.map(topicId => tasksByTopics[topicId].reduce((acc, task) => acc + task.mark, 0))
		const topicsMaxResults = topicsIds.map(topicId => tasksByTopics[topicId].reduce((acc, task) => acc + 100, 0))

		console.log(topicsResults);
		
		const labels = topicsIds.map(topicId => topics.find(t => t.id === topicId)?.title ?? '')

		const data: ChartData<'bar', number[]> = {
			labels,
			datasets: [
				{
					data: topicsResults,
					label: 'Прогресс по теме',
					backgroundColor: chartsColorsPallete[0],
					hoverBackgroundColor: chartsColorsPalleteBright[0],
					hoverBorderColor: chartsColorsPalleteDark[0],
				},
				{
					data: topicsMaxResults,
					label: 'Максимальный балл',
					backgroundColor: chartsColorsPallete[1],
					hoverBackgroundColor: chartsColorsPalleteBright[1],
					hoverBorderColor: chartsColorsPalleteDark[1],
				},
			]
		}

		const config: ChartConfiguration<'bar', number[]> = {
			type: 'bar',
			data,
		}
		return { config }
	}

	export const courseTopicsRatio = (training: Training, progress: ProfileProgress[]) => {
		const { modules, topics } = training.course

		const topicsByModules = topics.reduce((acc, topic) => {
			const topicModuleIndex = modules.findIndex(m => m.id === topic.moduleId)

			if (acc[topicModuleIndex]) {
				acc[topicModuleIndex].push(topic)
			} else {
				acc[topicModuleIndex] = [topic]
			}

			return acc;
		}, [] as Array<ModuleTopic[]>)

		const courseTopicsByModules = topicsByModules.map(topics => topics.map((topic) => topic.practice ? topic.practice.tasks.reduce((acc, task, i) => (i + 1) * 100, 0) : 0))

		// console.log(courseTopicsByModules);
		
		let tasksByModules = progress.reduce((acc, task) => {
			const moduleId = topics.find(t => t.id === task.topicId)?.moduleId
			if (moduleId) {
				if (acc[moduleId]) {
					acc[moduleId].push(...task.records)
				}

				if (!acc[moduleId]) {
					acc[moduleId] = [...task.records]
				}
			}

			return acc;
		}, {} as { [key: string]: Array<ProfileProgressRecord> })
		
		const modulesIds = modules.map(m => m.id)
		modulesIds.forEach(key => {
			tasksByModules[key] = getTopicRecordsLastResult(tasksByModules[key] ?? [])
		})
		
		const courseTasks = topics.reduce((acc, topic) => {
			const tasks = [...topic.practice ? topic.practice.tasks : []]
			acc.push(...tasks)
			return acc
		}, [] as TopicTask[])

		// console.log(courseTasks);

		const tasksResults = Object.keys(tasksByModules).map(key => {
			const records = tasksByModules[key].filter(record => courseTasks.findIndex(task => task.id === record.taskId) > -1)
			const tasksByTopics = topics.reduce((acc, topic) => {
				const topicTasks = topic.practice?.tasks
				if (topicTasks) {
					const tasksFromTopic = records.filter(record => topicTasks.some(task => task.id === record.taskId))
					console.log(tasksFromTopic);
					acc.push(tasksFromTopic.reduce((acc, record) => acc + record.mark, 0))
				}

				return acc
			}, [] as number[])
			console.log(tasksByTopics);
			return tasksByTopics
		})

		const maxTasksInModule = Object.keys(tasksByModules).reduce((acc, key) => {
			if (tasksByModules[key].length > acc) {
				return tasksByModules[key].length
			}
			return acc
		}, 0)

		// const datasetsLength = courseTopicsByModules2.reduce((max, points) => points.length > max ? points.length : max, 0)
		// console.log('datasetsLength', datasetsLength);
		// const datasets = []
		// for (let i = 0; i < datasetsLength; i++) {
		// 	const dataset: number[] = []
		// 	courseTopicsByModules2.forEach(moduleTopicsPoints => dataset.push(moduleTopicsPoints[i]))
		// 	console.log(dataset);
		// 	datasets.push(dataset.filter(item => item != null))
		// }

		// console.log('datasets', datasets);

		console.log('all', courseTopicsByModules);
		console.log('done', tasksResults);

		const allPointsDatasets = courseTopicsByModules.map((points, i) => {
			return {
				label: modules[i].title,
				data: points,
				stack: 'all',
			}
		})

		const maxTopicsLength = courseTopicsByModules.reduce((max, module) => module.length > max ? module.length : max, 0)

		const datasets: number[][] = []
		for (let i = 0; i < maxTopicsLength; i++) {
			const topicsStack: number[] = []
			courseTopicsByModules.forEach(moduleTopics => topicsStack.push(moduleTopics[i]))
			datasets.push(topicsStack.filter(it => it != null))
		}		

		console.log('datasets', datasets);

		const donePointsDatasets = tasksResults.map((points, i) => {
			return {
				label: modules[i].title,
				data: points,
				stack: 'all',
			}
		})

		console.log(allPointsDatasets);
		console.log(donePointsDatasets);

		const labels = modules.map(module => module.title)

		const data: ChartData<'bar', number[]> = {
			labels,
			datasets: datasets.map((dataset, i) => ({
					label: 'Тема ' + (i + 1),
					data: dataset,
					stack: 'stack 0',
					backgroundColor: chartsColorsPallete[i],
					hoverBackgroundColor: chartsColorsPalleteBright[i],
					hoverBorderColor: chartsColorsPalleteDark[i],
			}))
			// datasets: [
			// 	...allPointsDatasets,
			// 	...donePointsDatasets
			// ]
		}


		const config: ChartConfiguration<'bar', number[]> = {
			type: 'bar',
			data,
		}
		return { config }
	}

	export const tasksRadar = (topicId: string, training: Training, progress: ProfileProgress[]) => {
		const topicRecords = progress.find(p => p.topicId === topicId)?.records ?? []

		const topicLastProgress = getTopicRecordsLastResult(topicRecords).map(it => it.mark)

		const backgroundColors = topicLastProgress.map((_, i) => chartsColorsPallete[i])
		const hoverBackgroundColors = topicLastProgress.map((_, i) => chartsColorsPalleteBright[i])
		const hoverBorderColors = topicLastProgress.map((_, i) => chartsColorsPalleteDark[i])

		const data: ChartData<'polarArea', number[]> = {
			labels: topicLastProgress.map((_, i) => `Задание №${i + 1}`),
			datasets: [{
				label: 'Выполненные задания',
				data: topicLastProgress,
				backgroundColor: backgroundColors,
				hoverBackgroundColor: hoverBackgroundColors,
				borderColor: 'transparent',
				hoverBorderColor: hoverBorderColors
			}]
		}
		
		const config: ChartConfiguration<'polarArea', number[]> = {
			type: 'polarArea',
			data,
		}
		return { config }
	}

	export const overallChart = (profiles: TrainingProfileTraining[], progress: ProfileProgress[]) => {
		const trainings = profiles.map(p => p.training)
		
		const topics: ModuleTopic[] = []
		trainings.forEach(t => {
			topics.push(...t.course.topics)
		})

		const modules: CourseModule[] = []
		trainings.forEach(t => {
			modules.push(...t.course.modules)
		})


		let tasksByModules = progress.reduce((acc, task) => {
			const moduleId = topics.find(t => t.id === task.topicId)?.moduleId
			if (moduleId) {
				if (acc[moduleId]) {
					acc[moduleId].push(...task.records)
				}

				if (!acc[moduleId]) {
					acc[moduleId] = [...task.records]
				}
			}

			return acc;
		}, {} as { [key: string]: Array<ProfileProgressRecord> })

		const modulesIds = Object.keys(tasksByModules)

		modulesIds.map(key => {
			tasksByModules[key] = getTopicRecordsLastResult(tasksByModules[key])
		})
		
		const labels = [] as string[]
		const modulesLabels = [] as (string | undefined)[]
		const datasets = modulesIds.map(key => {
			const records = tasksByModules[key]

			const moduleTitle = modules.find(m => m.id === key)?.title
			modulesLabels.push(moduleTitle)

			const date = records.at(-1)?.date
			if (date) {
				labels.push(format(new Date(date), 'dd.MM.yy'))
			}
			return records			
		})
		.map(rec => rec.reduce((acc, r) => acc + r.mark, 0))
		.filter(Boolean)
				
		const data: ChartData<'line', number[]> = {
			labels: [...new Set(labels)],
			datasets: datasets.map((ds, i) => {
				return {
					label: modulesLabels[i] ?? '',
					data: [ds],
					backgroundColor: chartsColorsPallete[i],
					hoverBackgroundColor: chartsColorsPalleteBright[i],
					hoverBorderColor: chartsColorsPalleteDark[i],
				}
			})
		}

		const config: ChartConfiguration<'line', number[]> = {
			type: 'line',
			data,
		}
		return { config }
	}
}

function getTopicRecordsLastResult(records: ProfileProgressRecord[]): ProfileProgressRecord[] {
	return records
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.reduce((acc, record) => {
			const taskRecord = acc.find(t => t.taskId === record.taskId)

			if (!taskRecord) {
				acc.push(record)
			}
		return acc
	}, [] as ProfileProgressRecord[])
}

function partition(array: any[], isValid: (item: any) => boolean) {
	return array.reduce(([pass, fail], elem) => {
	  	return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
	}, [[], []]);
}
