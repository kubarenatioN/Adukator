import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../typings/course.types';

@Pipe({
  name: 'courseDuration'
})
export class CourseDurationPipe implements PipeTransform {

  public transform(value: Course): number {
    const { topics } = value
    return topics.reduce((days, t) => days + (t.duration ?? 0), 0)
  }

}
