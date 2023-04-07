import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Course, StudentCourse } from '../typings/course.types';
import { CoursesService } from './courses.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class StudentCoursesService {
	public courses$!: Observable<StudentCourse[]>;

	constructor(private userService: UserService, private coursesService: CoursesService) {
        this.courses$ = this.getCourses()
    }

	private getCourses(): Observable<StudentCourse[]> {
        return this.userService.user$.pipe(
            switchMap(user => this.coursesService.getStudentCourses(user.uuid)),
            map(response => response.data),
            shareReplay(1),
        )
    }
}
