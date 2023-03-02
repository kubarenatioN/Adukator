import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { Course, CourseReview } from '../typings/course.types';
import { AdminCoursesService } from './admin-courses.service';
import { CoursesService } from './courses.service';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
    public reviewCoursesList$: Observable<CourseReview[]>

	constructor(private adminCoursesService: AdminCoursesService) {
        this.reviewCoursesList$ = this.adminCoursesService.reviewCoursesList$;
    }
}
