import { getTodayTime } from "src/app/helpers/date-fns.helper";
import { ModuleTopic } from "src/app/typings/course.types";

export const isActualTopic = (topic: ModuleTopic): boolean => {
    // const now = getTodayTime()
    // const isActual = now > new Date(topic.startDate)
    
    // return isActual
    return false
}

export const isPastTopic = (topic: ModuleTopic): boolean => {
    // const now = getTodayTime()
    // const isPast = now > new Date(topic.endDate)
    
    // return isPast
    return false
}