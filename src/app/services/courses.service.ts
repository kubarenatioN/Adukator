import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseEnrollAction, CourseFormData, CourseMembers, CourseReview, GetCourseMembersParams, StudentCourse, TeacherCourses } from '../typings/course.types';
import { CoursesResponse, CourseEnrollResponse, CoursesSelectResponse, CourseReviewHistory } from '../typings/response.types';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    public courses$: Observable<Course[]>
    public studentCourses$: Observable<StudentCourse[] | null>

    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

	constructor(private dataService: DataService, private userService: UserService) {
        this.courses$ = this.getAllCourses()
        this.studentCourses$ = this.getStudentCourses();

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

    public getCourseReviewVersion(courseId: string) {
        return this.userService.user$.pipe(
            switchMap(user => {
                return this.getCourses({
                    requestKey: NetworkRequestKey.GetCourses,
                    id: 'CourseReviewVersion',
                    type: ['review'],
                    coursesIds: [courseId],
                    fields: CoursesSelectFields.Full,
                    authorId: user.role === 'teacher' ? user.id : undefined
                })
            }),
            map(response => response.review[0])
        )
    }

    // Main generic method to get any course, try to reuse it everywhere
    public getCourses({ requestKey, type, coursesIds, authorId, studentId, fields, id }: {
        requestKey: string,
        type: ('published' | 'review')[],
        id: string,
        coursesIds?: string[],
        authorId?: number,
        studentId?: number,
        fields?: string[],
    }) {
        const payload = NetworkHelper.createRequestPayload(requestKey, {
            body: {
                type,
                coursesIds,
                authorId,
                studentId,
                fields: fields ?? []
            },
            params: { reqId: id }
        })

        return this.dataService.send<CoursesSelectResponse>(payload)
    }

    public getCourseReviewHistory(masterId: string) {
        const requestKey = NetworkRequestKey.GetCourseReviewHistory
        const payload = NetworkHelper.createRequestPayload(requestKey, {
            body: {
                masterId,
                fields: CoursesSelectFields.ReviewHistory,
            },
            params: { reqId: 'ReviewHistory' }
        })

        return this.dataService.send<CourseReviewHistory>(payload).pipe(
            map(response => response.versions)
        )
    }

    public createCourseReviewVersion(courseData: CourseReview, { isMaster }: { isMaster: boolean }): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.CreateCourseVersion, {
            body: { course: courseData, isMaster },
            params: { reqId: 'CreateReviewVersion' }
        })
        return this.dataService.send<unknown>(payload)
    }

    public updateCourse(id: number, form: CourseFormData) {
        
    }

    public makeCourseEnrollAction(userIds: number[], courseId: string, action: CourseEnrollAction) {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.EnrollCourse, {
            body: {
                userIds,
                courseId,
                action,
            }
        })
        return this.dataService.send<CourseEnrollResponse>(payload)
    }

    public getCourseMembers(reqParams: GetCourseMembersParams): Observable<CourseMembers> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetCourseMembers, {
            params: {
                ...reqParams
            }
        })
        return this.dataService.send<CoursesResponse<CourseMembers>>(payload).pipe(
            map(res => res.data)
        );
    }

    private getAllCourses() {
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
}
