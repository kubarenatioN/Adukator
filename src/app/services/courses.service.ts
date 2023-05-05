import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseReview } from '../typings/course.types';
import { CoursesResponse, CoursesSelectResponse, CourseReviewHistory } from '../typings/response.types';
import { Training } from '../typings/training.types';
import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class CoursesService {
    private coursesStore$ = new BehaviorSubject<{
        published: Course[],
        review: CourseReview[]
    }>({
        published: [],
        review: []
    });

    public published$ = this.coursesStore$.asObservable().pipe(map(store => store.published), shareReplay(1));
    public review$ = this.coursesStore$.asObservable().pipe(map(store => store.review), shareReplay(1));

	constructor(private dataService: DataService, private userService: UserService) {
        
    }

    public getTeacherCourses(userUUID: string) {
        const options = {
            requestKey: NetworkRequestKey.SelectCourses,
            authorId: userUUID,
            fields: CoursesSelectFields.Short,
        }
        return forkJoin({
            published: this.getCourses<{ data: Course[] }>({
                ...options,
                reqId: 'SelectTeacherPublishedCourses',
                type: 'published',
            }),
            review: this.getCourses<{ data: CourseReview[] }>({
                ...options,
                reqId: 'SelectTeacherReviewCourses',
                type: 'review',
            }),
        })
    }

    public getCourseReviewVersion(courseId: string) {
        return this.userService.user$.pipe(
            switchMap(user => {
                return this.getCourses<{ data: CourseReview[] }>({
                    requestKey: NetworkRequestKey.SelectCourses,
                    reqId: 'CourseReviewVersion',
                    type: 'review',
                    coursesIds: [courseId],
                    fields: CoursesSelectFields.Full,
                    authorId: user.role === 'teacher' ? user.uuid : undefined
                })
            }),
            map(response => response.data[0])
        )
    }

    // Main generic method to get any course, try to reuse it everywhere
    public getCourses<T>({ requestKey, type, coursesIds, authorId, fields, reqId }: {
        requestKey?: string,
        type: 'training' | 'review' | 'published',
        reqId: string,
        coursesIds?: string[],
        authorId?: string,
        fields?: string[],
    }) {
        const payload = NetworkHelper.createRequestPayload(requestKey ?? NetworkRequestKey.SelectCourses, {
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

    // public getStudentCourses(userId: string) {
    //     const key = NetworkRequestKey.StudentCourses
    //     const payload = NetworkHelper.createRequestPayload(key, {
    //         body: {
    //             userId,
    //             fields: CoursesSelectFields.Short
    //         },
    //         params: { reqId: key }
    //     })
    //     return this.dataService.send<{ 
    //         data: Training[]
    //     }>(payload);
    // }
}
