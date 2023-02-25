import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, merge, Observable, of, shareReplay, Subject, switchMap, take } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CoursesResponse, CourseFormData, CourseReview } from '../typings/course.types';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    private coursesForReviewStore$ = new Subject<Course[]>();

    public courses$: Observable<Course[]>
    public userCourses$: Observable<CoursesResponse | null>

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private userService: UserService, private router: Router) {
        this.courses$ = this.getCourses()
        this.userCourses$ = this.getAllUserCourses()

        this.resetCoursesCaching$.next();
        this.resetCoursesForReviewCaching$.next();
    }

    public getCourseById(id: number): Observable<Course | null> {
        return this.courses$.pipe(map(courses => courses.find(c => c.id === id) ?? null));
    }

    public getUserReviewCourse(courseId: number): Observable<CourseReview | null> {
        return this.userCourses$.pipe(map(userCourses => {
            const courses: CourseReview[] = userCourses?.review ?? []
            return courses.find(course => course.id === courseId) ?? null
        }))
    }

    public getCourseReviewHistory(courseId: number): Observable<CourseReview[]> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetReviewCourseHistory, {
            params: {
                id: courseId
            }
        })
        return this.dataService.send<CourseReview[]>(payload)
    }

    // public publishCourse(id: number) {
    //     const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, { body: { id } })
    //     this.dataService.send<CoursesResponse>(payload)
    //     .pipe(
    //         switchMap(() => {
    //             return this.coursesForReview$
    //         }),
    //         take(1)
    //     )
    //     .subscribe(courses => {
    //         this.coursesForReviewStore$.next(courses.filter(course => course.id !== id))
    //         this.router.navigate(['/app/admin'])
    //     })
    // }

    public editCourse(id: number, form: CourseFormData) {
        
    }

    private getCourses() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllCourses)
		return this.resetCoursesCaching$.pipe(
            switchMap(() => this.dataService.send<Course[]>(payload)),
            shareReplay(1)
        )
	}

    private getAllUserCourses(): Observable<CoursesResponse | null> {
        return this.userService.user$.pipe(
            switchMap(user => {
                if (user === null) {
                    return of(null);
                }

                if (user.role === 'admin') {
                    return of({})
                }

                const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCoursesByUser, {
                    body: { id: user.id }
                })
                return this.dataService.send<CoursesResponse>(payload)
            }),
            shareReplay(1),
        )
	}
}
