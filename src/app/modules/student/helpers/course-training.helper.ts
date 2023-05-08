import { add, addDays } from "date-fns/esm";
import { getTodayTime } from "src/app/helpers/date-fns.helper";
import { ModuleTopic } from "src/app/typings/course.types";
import { Training } from "src/app/typings/training.types";

export const formatTopicsDeadlines = (topics: ModuleTopic[], training: Training) => {
    const now = getTodayTime()
    let daysFromStart = 0
    const trainingStart = new Date(training.startAt)
    topics.forEach(topic => {
        topic.startAt = addDays(trainingStart, daysFromStart).toUTCString()
        const topicStartDate = new Date(topic.startAt)
        topic.isActual = now > topicStartDate && now < addDays(topicStartDate, topic.duration)
        topic.isPast = now > addDays(topicStartDate, topic.duration)
        daysFromStart += topic.duration
    })

    return topics
}
