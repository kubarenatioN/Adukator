import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseReview } from '../typings/course.types';
import { AdminCoursesService } from './admin-courses.service';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
    public reviewCoursesList$: Observable<CourseReview[]>

	constructor(private adminCoursesService: AdminCoursesService) {
        this.reviewCoursesList$ = this.adminCoursesService.reviewCoursesList$;
    }
}
