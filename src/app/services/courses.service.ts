import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseFormData, CourseReview, StudentCourse, TeacherCourses } from '../typings/course.types';
import { CourseEnrollAction, CourseEnrollResponse, CoursesResponse } from '../typings/response.types';
import { ConfigService } from './config.service';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    public courses$: Observable<Course[]>
    public studentCourses$: Observable<StudentCourse[] | null>
    public teacherUserCourses$: Observable<TeacherCourses | null>

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private userService: UserService, private configService: ConfigService) {
        this.courses$ = this.getCourses()
        this.studentCourses$ = this.getStudentCourses();
        this.teacherUserCourses$ = this.getTeacherCourses();

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
                    return res.data[0]
                }
                return null
            }),
        );
    }

    public getTeacherReviewCourse(courseId: number): Observable<CourseReview | null> {
        return this.teacherUserCourses$.pipe(
            map(teacherCourses => {
                const courses: CourseReview[] = teacherCourses?.review ?? []
                return courses.find(course => course.id === courseId) ?? null
            })
        )
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

    public makeCourseEnrollAction(courseId: number, action: CourseEnrollAction) {
        return this.userService.user$.pipe(
            switchMap(user => {
                if (user) {
                    const userId = user.id
                    const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.EnrollCourse, {
                        body: {
                            userIds: [userId],
                            courseId,
                            action,
                        }
                    })

                    return this.dataService.send<CourseEnrollResponse>(payload)
                }
                return throwError(() => new Error('Try to enroll course with no user.'))
            }),
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

    private getStudentCourses() {
        return this.userService.user$.pipe(
            switchMap(user => {
                if (user === null) {
                    return of(null);
                }

                const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetStudentCourses, {
                    body: { userId: user.id }
                })
                return this.dataService.send<CoursesResponse<StudentCourse[]>>(payload).pipe(
                    map(res => res.data)
                )
            }),
            shareReplay(1),
        )
	}

    private getTeacherCourses() {
        return this.userService.user$.pipe(
            switchMap(user => {
                if (user === null || user.role !== 'teacher') {
                    return of(null);
                }

                const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetTeacherCourses, {
                    body: { id: user.id }
                })
                return this.dataService.send<CoursesResponse<TeacherCourses | null>>(payload).pipe(
                    map(res => res.data)
                )
            }),
            shareReplay(1),
        )
    }
}
