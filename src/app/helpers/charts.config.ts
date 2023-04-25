import { ChartConfiguration, ChartData, ChartDataset } from "chart.js"
import { format } from "date-fns"
import { ModuleTopic } from "../typings/course.types"
import { ProfileProgress } from "../typings/training.types"

type Dataset = { x: string, y: number }
type ChartDataType = ChartData<'line', Dataset[], string>

export const createTopicsProgressConfig = (topics: ModuleTopic[], progress: ProfileProgress[]): 
    ChartConfiguration<'line', Dataset[], string> => {
    const labels = [] as string[]
    const datasets = [] as ChartDataset<'line', Dataset[]>[]
    topics.forEach(topic => {
        const topicProgress = progress.find(progress => progress.topicId === topic.id)

        const dates = topicProgress?.records.map(record => record.date) ?? []
        labels.push(...dates)

        topic.practice?.tasks.forEach((task, i) => {
            const taskRecords = topicProgress?.records.filter(record => record.taskId === task.id)
            if (taskRecords && taskRecords.length > 0) {
                datasets.push({
                    data: taskRecords.map(record => {
                        return {
                            x: format(new Date(record.date), 'dd.MM HH:mm'),
                            y: record.mark ?? 0,
                        }
                    }),
                    label: `${topic.title} - задание ${i + 1}`
                })
            }
        })
    })

    const formattedLabels = [...new Set(labels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()))]
        .map(timeString => format(new Date(timeString), 'dd.MM HH:mm'))
    return {
        type: 'line',
        data: {
            datasets,
            labels: formattedLabels,
        }
    }
}