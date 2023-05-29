import { Pipe, PipeTransform } from '@angular/core';
import { Course, LearnCatalogCourse } from '../typings/course.types';

@Pipe({
  name: 'courseStatus'
})
export class CourseStatusPipe implements PipeTransform {

  transform(course: Course): string {
    return !!course?.trainings?.find(t => t.status === 'active') 
      ? 'Идет тренинг'
      : 'Идет набор'
  }

}
