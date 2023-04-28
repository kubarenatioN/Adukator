import { ChartConfiguration, ChartData, ChartDataset } from "chart.js"
import { format } from "date-fns"
import { ModuleTopic, TopicTask } from "../typings/course.types"
import { PersonalTask, ProfileProgress, ProfileProgressRecord } from "../typings/training.types"

type Dataset = { x: string, y: number }
type ChartDataType = ChartData<'line', Dataset[], string>

export const createTopicsProgressConfig = (topics: ModuleTopic[], progress: ProfileProgress[], personalTasks?: PersonalTask[]): 
    ChartConfiguration<'line', Dataset[], string> => {
    const labels = [] as string[]
    const datasets = [] as ChartDataset<'line', Dataset[]>[]

    const topicProgress = progress.reduce((acc, profile) => {
        acc.push(...profile.records)
        return acc
    }, [] as ProfileProgressRecord[])
    
    const dates = topicProgress.map(record => record.date) ?? []
    labels.push(...new Set(dates))

    topics.forEach(topic => {
        let topicTaskCounter = 0
        topic.practice?.tasks.forEach((task, i) => {
            topicTaskCounter++
            const taskRecords = topicProgress.filter(record => record.taskId === task.id)
            if (taskRecords && taskRecords.length > 0) {
                datasets.push({
                    data: taskRecords.map(record => {
                        return {
                            x: format(new Date(record.date), 'dd.MM HH:mm'),
                            y: record.mark ?? 0,
                        }
                    }),
                    label: `${topic.title} - задание ${topicTaskCounter}`
                })
            }
        })
        const topicPersonalTasks = personalTasks?.filter(task => task.topicId === topic.id)
        if (topicPersonalTasks && topicPersonalTasks.length > 0) {
            topicPersonalTasks.forEach(personal => {
                topicTaskCounter++
                const taskRecords = topicProgress.filter(record => record.taskId === personal.task.id)
                datasets.push({
                    data: taskRecords.map(record => {
                        return {
                            x: format(new Date(record.date), 'dd.MM HH:mm'),
                            y: record.mark ?? 0,
                        }
                    }),
                    label: `${topic.title} - задание ${topicTaskCounter}`
                })
            })
        }
    })

    const formattedLabels = labels
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(timeString => format(new Date(timeString), 'dd.MM HH:mm'))
    return {
        type: 'line',
        data: {
            datasets,
            labels: formattedLabels,
        }
    }
}