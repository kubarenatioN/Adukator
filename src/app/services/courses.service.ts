import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, merge, Observable, ReplaySubject, shareReplay, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { DATA_ENDPOINTS } from '../constants/network.constants';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CoursesResponse, CreateCourseFormData } from '../typings/course.types';
import { DataRequestPayload, DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    private coursesStore$ = new Subject<Course[]>();
    private coursesForReviewStore$ = new Subject<Course[]>();

    public courses$: Observable<Course[]>
    public coursesForReview$: Observable<Course[]>

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private router: Router) {
        this.courses$ = this.getCourses()
        this.coursesForReview$ = merge(this.getCoursesForReview(), this.coursesForReviewStore$.asObservable()).pipe(
            shareReplay(1),
        )
        // this.courses$ = this.getCourses()
        // this.coursesForReview$ = this.getCoursesForReview()

        this.resetCoursesCaching$.next();
        this.resetCoursesForReviewCaching$.next();
    }

	public getCourses() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCourse)
		return this.resetCoursesCaching$.pipe(
            switchMap(() => this.dataService.send<CoursesResponse>(payload)),
            map(courses => courses.published || []),
            shareReplay(1)
        )
	}

    public getCoursesForReview() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCourse, {
            status: ['review'],
        })
        return this.resetCoursesForReviewCaching$.pipe(
            switchMap(() => this.dataService.send<CoursesResponse>(payload)),
            map(courses => courses.review || []),
            shareReplay(1)
        )
	}

    public getCourseById(id: number): Observable<Course | null> {
        return this.courses$.pipe(map(courses => courses.find(c => c.id === id) ?? null));
    }

    public publishCourse(id: number) {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, { id })
        this.dataService.send<CoursesResponse>(payload)
        .pipe(
            tap((res) => {
                this.resetCoursesCaching$.next()
                console.log('111 publish course', res);
            }),
            switchMap(res => {
                this.coursesForReviewStore$.next(res.review || []);
                return this.coursesForReview$
            })
        )
        .subscribe(res => {
            // console.log('111 publish course', res);
            // this.resetCoursesCaching$.next()
            // this.resetCoursesForReviewCaching$.next()
            this.router.navigate(['/app/admin'])
        })
    }

    public editCourse(id: number, form: CreateCourseFormData) {
        
    }
}
