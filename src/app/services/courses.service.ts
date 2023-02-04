import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DATA_ENDPOINTS } from '../constants/network.constants';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CreateCourseFormData } from '../typings/course.types';
import { DataRequestPayload, DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    // private coursesStore$ = new BehaviorSubject<Course[]>([]);
    // private coursesForReviewStore$ = new BehaviorSubject<Course[]>([]);

    // public courses$ = this.coursesStore$.asObservable().pipe(
    //     shareReplay()
    // );
    // public coursesForReview$ = this.coursesForReviewStore$.asObservable().pipe(
    //     shareReplay()
    // );

    private coursesStore$ = new BehaviorSubject<Course[]>([]);
    private coursesForReviewStore$ = new BehaviorSubject<Course[]>([]);

    public courses$: Observable<Course[]>
    public coursesForReview$: Observable<Course[]>
    // public courses$ = this.coursesStore$.asObservable().pipe(shareReplay())
    // public coursesForReview$ = this.coursesForReviewStore$.asObservable().pipe(shareReplay())

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private router: Router) {
        this.courses$ = this.getCourses()
        this.coursesForReview$ = this.getCoursesForReview()

        this.resetCoursesCaching$.next();
        this.resetCoursesForReviewCaching$.next();
    }

	public getCourses() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCourse)
		return this.resetCoursesCaching$.pipe(
            tap(() => { 
                console.log('111 fire reset')
            }),
            switchMap(() => {
                return this.dataService.send<Course[]>(payload).pipe(
                    tap(() => { 
                        console.log('111 send courses request')
                    }),
                )
            }),
            shareReplay(1)
        )
	}

    public getCoursesForReview() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCourse, {
            status: 'review',
        })
        return this.resetCoursesForReviewCaching$.pipe(
            switchMap(() => {
                return this.dataService.send<Course[]>(payload).pipe(
                    tap(() => { 
                        console.log('111 send review courses request')
                    }),
                )
            }),
            shareReplay(1)
        )
	}

    public getCourseById(id: number): Observable<Course | null> {
        return this.courses$.pipe(map(courses => courses.find(c => c.id === id) ?? null));
    }

    public publishCourse(id: number) {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, { id })
        this.dataService.send(payload).subscribe(res => {
            console.log('111 publish course', res);
            this.resetCoursesCaching$.next()
            this.resetCoursesForReviewCaching$.next()
            this.router.navigate(['/app/admin'])
        })
    }

    public editCourse(id: number, form: CreateCourseFormData) {
        const payload: DataRequestPayload = {
			method: 'POST',
			url: `${DATA_ENDPOINTS.api.course}/update`,
			body: {
				status: 'published',
			},
		};
    }
}
