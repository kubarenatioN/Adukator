import { Pipe, PipeTransform } from '@angular/core';
import { differenceInWeeks, millisecondsInHour } from 'date-fns';
import { getDurationInMilliseconds } from '../helpers/date-fns.helper';
import { Course } from '../typings/course.types';

const millisecondsInDay = millisecondsInHour * 24
const millisecondsInWeek = millisecondsInDay * 7

@Pipe({
	name: 'timeDuration',
})
export class TimeDurationPipe implements PipeTransform {
    
	transform(course: Course, unit: 'w' | 'd' = 'w'): string {
        // const millis = getDurationInMilliseconds(course.startDate, course.endDate)
        // let duration = -1;
        // let unitText = '';
        // switch (unit) {
        //     case 'w': {
        //         duration =  Math.trunc(millis / millisecondsInWeek)
        //         unitText = 'Недель';
        //         break; 
        //     }
        //     case 'd': {
        //         duration =  Math.trunc(millis / millisecondsInDay)
        //         unitText = 'Дней'
        //         break;
        //     }
        //     default:
        //         break;
        // }

        // return `${unitText}: ${duration}`;
        return '12 weeks'
    }
}
