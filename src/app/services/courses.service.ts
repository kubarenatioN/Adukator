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

    public catalogCourses$: Observable<Course[]>;

	constructor(private dataService: DataService, private userService: UserService) {
        this.catalogCourses$ = this.catalogCoursesStore$.pipe(
            shareReplay(1)
        )
    }

    public getCourseReviewVersion(courseId: string) {
        return this.userService.user$.pipe(
            switchMap(user => {
                return this.getCourses<CoursesSelectResponse>({
                    requestKey: NetworkRequestKey.GetCourses,
                    reqId: 'CourseReviewVersion',
                    type: ['review'],
                    coursesIds: [courseId],
                    fields: CoursesSelectFields.Full,
                    authorId: user.role === 'teacher' ? user.uuid : undefined
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
    public getCourses<T>({ requestKey, type, coursesIds, authorId, fields, reqId }: {
        requestKey?: string,
        type: ('published' | 'review')[],
        reqId: string,
        coursesIds?: string[],
        authorId?: number,
        fields?: string[],
    }) {
        const payload = NetworkHelper.createRequestPayload(requestKey ?? NetworkRequestKey.GetCourses, {
            body: {
                type,
                coursesIds,
                authorId,
                fields: fields ?? []
            },
            params: { reqId }
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

    public getStudentCourses(userId: number) {
        const key = NetworkRequestKey.StudentCourses
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                userId,
                fields: CoursesSelectFields.Short
            },
            params: { reqId: 'StudentCourses' }
        })
        return this.dataService.send<{ data: StudentCourse[] }>(payload);
    }

    public isTrainingCourseAvailable(courseId: string, userId: number) {
        const key = NetworkRequestKey.TrainingAvailable
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                courseId, userId
            },
            params: { reqId: 'IsTrainingAvailable' }
        })
        return this.dataService.send<{ isAvailable: boolean }>(payload).pipe(
            map(res => res.isAvailable)
        );
    }
}
