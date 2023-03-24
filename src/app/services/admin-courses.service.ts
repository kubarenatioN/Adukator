import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseReview } from '../typings/course.types';
import { CoursesResponse } from '../typings/response.types';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class AdminCoursesService {
    public reviewCoursesList$: Observable<CourseReview[]>
    
	constructor(private dataService: DataService) {
        this.reviewCoursesList$ = this.getReviewCourses()
    }

    // get any course under review by id
    public getReviewCourse(id: number): Observable<CourseReview> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAdminReviewCourseById, {
            urlId: id
        })
        return this.dataService.send<CoursesResponse<CourseReview[]>>(payload).pipe(
            map(res => res.data[0])
        )
    }

    public publish(course: Course, masterId: number): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, {
            body: { course, masterId },
        });
        return this.dataService.send(payload);
    }

    public saveCourseReview(id: number, comments: { overallComments: string; modules: string }): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.UpdateCourseReview, {
            body: { id, comments }
        })
        return this.dataService.send(payload);
    }

	private getReviewCourses(): Observable<CourseReview[]> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllAdminReviewCourses)
        return this.dataService.send<CoursesResponse<CourseReview[]>>(payload).pipe(
            map(res => res.data),
            shareReplay(1),
        )
    }
}
