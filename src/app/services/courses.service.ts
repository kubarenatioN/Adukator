import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, UserCourses, CourseFormData, CourseReview } from '../typings/course.types';
import { CoursesResponse } from '../typings/response.types';
import { ConfigService } from './config.service';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    public courses$: Observable<Course[]>
    public userCourses$: Observable<UserCourses | null>

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private userService: UserService, private configService: ConfigService) {
        this.courses$ = this.getCourses()
        this.userCourses$ = this.getAllUserCourses()

        this.resetCoursesCaching$.next();
        this.resetCoursesForReviewCaching$.next();
    }

    public getCourseById(id: number): Observable<Course | null> {        
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCourseById, {
            urlId: id,
        })
        return this.dataService.send<CoursesResponse<Course[] | null>>(payload).pipe(
            map(res => {
                if (res.data && res.data[0]) {
                    console.log('getCourseById', res.data[0]);
                    return res.data[0]
                }
                return null
            }),
        );
    }

    public getUserReviewCourse(courseId: number): Observable<CourseReview | null> {
        return this.userCourses$.pipe(map(userCourses => {
            const courses: CourseReview[] = userCourses?.review ?? []
            return courses.find(course => course.id === courseId) ?? null
        }))
    }

    public getCourseReviewHistory(courseId: number) {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetReviewCourseHistory, {
            params: {
                id: courseId
            }
        })
        return this.dataService.send<CoursesResponse<CourseReview[]>>(payload).pipe(
            map(res => res.data)
        )
    }

    public createCourseReviewVersion(courseData: CourseReview, { isMaster }: { isMaster: boolean }): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.CreateCourse, {
            body: { course: courseData, isMaster }
        })
        return this.dataService.send<unknown>(payload)
    }

    public updateCourse(id: number, form: CourseFormData) {
        
    }

    public getCategory(key: string): Observable<string | null> {
        return this.configService.loadCourseCategories().pipe(
            map((categories: {key: string; name: string}[]) => categories.find(c => c.key === key)?.name ?? null),
        )
    }

    private getCourses() {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllCourses)
		return this.resetCoursesCaching$.pipe(
            switchMap(() => this.dataService.send<CoursesResponse<Course[]>>(payload)),
            map(res => res.data),
            shareReplay(1)
        )
	}

    private getAllUserCourses() {
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
                return this.dataService.send<CoursesResponse<UserCourses | null>>(payload).pipe(
                    map(res => res.data)
                )
            }),
            shareReplay(1),
        )
	}
}
