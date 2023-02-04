import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { Course } from '../typings/course.types';
import { CoursesService } from './courses.service';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
    public courses$ = new Observable<Course[]>()

	constructor(private coursesService: CoursesService) {
        this.courses$ = this.coursesService.coursesForReview$;
    }

    public getCourseById(id: number): Observable<Course | null> {
        return this.courses$.pipe(map(courses => courses.find(c => c.id === id) ?? null))
    }
}
