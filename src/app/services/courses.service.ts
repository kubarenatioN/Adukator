import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, merge, Observable, of, shareReplay, Subject, switchMap, take } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CoursesResponse, CourseFormData } from '../typings/course.types';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    private coursesForReviewStore$ = new Subject<Course[]>();

    public courses$: Observable<Course[]>
    public coursesForReview$: Observable<Course[]>
    public userCourses$: Observable<CoursesResponse | null>

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private userService: UserService, private router: Router) {
        this.courses$ = this.getCourses()
        this.coursesForReview$ = merge(this.getCoursesForReview(), this.coursesForReviewStore$.asObservable()).pipe(
            shareReplay(1),
        )
        this.userCourses$ = this.getUserCourses()

        this.resetCoursesCaching$.next();
        this.resetCoursesForReviewCaching$.next();
    }

    public getCourseById(id: number): Observable<Course | null> {
        return this.courses$.pipe(map(courses => courses.find(c => c.id === id) ?? null));
    }

    public getCourseReviewHistory(courseId: number): Observable<Course[]> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetReviewCourseHistory, {
            params: {
                id: courseId
            }
        })
        return this.dataService.send<Course[]>(payload)
    }

    public publishCourse(id: number) {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, { body: { id } })
        this.dataService.send<CoursesResponse>(payload)
        .pipe(
            switchMap(() => {
                return this.coursesForReview$
            }),
            take(1)
        )
        .subscribe(courses => {
            this.coursesForReviewStore$.next(courses.filter(course => course.id !== id))
            this.router.navigate(['/app/admin'])
        })
    }

    public editCourse(id: number, form: CourseFormData) {
        
    }

    private getCourses() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllCourses)
		return this.resetCoursesCaching$.pipe(
            switchMap(() => this.dataService.send<Course[]>(payload)),
            shareReplay(1)
        )
	}

    private getCoursesForReview() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllReviewCourses)
        return this.resetCoursesForReviewCaching$.pipe(
            switchMap(() => this.dataService.send<Course[]>(payload)),
            shareReplay(1)
        )
	}

    private getUserCourses(): Observable<CoursesResponse | null> {
        return this.userService.user$.pipe(
            switchMap(user => {
                if (user === null) {
                    return of(null);
                }
                const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetUserCourses, {
                    body: {
                        id: user.id,
                        role: user.role
                    }
                })

                return this.dataService.send<CoursesResponse>(payload)
            }),
            shareReplay(1),
        )
	}
}
