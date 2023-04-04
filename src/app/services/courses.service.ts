import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseFormData, CourseReview, StudentCourse } from '../typings/course.types';
import { CoursesResponse, CoursesSelectResponse, CourseReviewHistory } from '../typings/response.types';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    private catalogCoursesStore$ = new BehaviorSubject<Course[]>([]);
    private resetCoursesCaching$ = new BehaviorSubject<void>(undefined);
    private resetCoursesForReviewCaching$ = new BehaviorSubject<void>(undefined);

    public catalogCourses$: Observable<Course[]>;
    public courses$: Observable<Course[]>
    public studentCourses$: Observable<StudentCourse[] | null>

	constructor(private dataService: DataService, private userService: UserService) {
        this.courses$ = this.getAllCourses()
        this.studentCourses$ = this.getStudentCourses();
        this.catalogCourses$ = this.catalogCoursesStore$.pipe(
            shareReplay(1)
        )

        this.resetCoursesCaching$.next();
        this.resetCoursesForReviewCaching$.next();
    }

    public getCourseReviewVersion(courseId: string) {
        return this.userService.user$.pipe(
            switchMap(user => {
                return this.getCourses<CoursesSelectResponse>({
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

    public getCoursesList(options: {
        pagination?: {
            offset: number,
            limit: number
        },
        filters?: {},
        fields: string[]
    }): void {
        const key = NetworkRequestKey.ListCourses
        const payload = NetworkHelper.createRequestPayload(key, {
            body: options,
            params: { reqId: 'CoursesList' }
        })
        this.dataService.send<{ data: Course[] }>(payload)
            .subscribe(res => this.catalogCoursesStore$.next(res.data))
    }

    // Main generic method to get any course, try to reuse it everywhere
    public getCourses<T>({ requestKey, type, coursesIds, authorId, studentId, fields, id }: {
        requestKey?: string,
        type: ('published' | 'review')[],
        id: string,
        coursesIds?: string[],
        authorId?: number,
        studentId?: number,
        fields?: string[],
    }) {
        const payload = NetworkHelper.createRequestPayload(requestKey ?? NetworkRequestKey.GetCourses, {
            body: {
                type,
                coursesIds,
                authorId,
                studentId,
                fields: fields ?? []
            },
            params: { reqId: id }
        })

        return this.dataService.send<T>(payload)
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
