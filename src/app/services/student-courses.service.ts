import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Course } from '../typings/course.types';
import { CoursesService } from './courses.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class StudentCoursesService {
	public courses$!: Observable<Course[]>;

	constructor(private userService: UserService, private coursesService: CoursesService) {
        this.courses$ = this.getCourses()
    }

	private getCourses(): Observable<Course[]> {
        return this.userService.user$.pipe(
            switchMap(user => this.coursesService.getStudentCourses(user.id)),
            map(response => response.data.map(record => record.course)),
            shareReplay(1),
        )
    }
}
