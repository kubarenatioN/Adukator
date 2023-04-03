import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseReview } from '../typings/course.types';
import { CoursesResponse } from '../typings/response.types';
import { CoursesService } from './courses.service';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class AdminCoursesService {
    public reviewCoursesList$: Observable<CourseReview[]>
    
	constructor(private dataService: DataService, private coursesService: CoursesService) {
        this.reviewCoursesList$ = this.getReviewCourses()
    }

    // get any course under review by id
    public getCourseReviewVersion(id: string): Observable<CourseReview> {
        return this.coursesService.getCourseReviewVersion(id);
    }

    public publish(course: Course, masterId: string): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, {
            body: { course, masterId },
        });
        return this.dataService.send(payload);
    }

    public saveCourseReview(id: string, comments: { overallComments: string; modules: string }): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.UpdateCourseReview, {
            body: { id, comments }
        })
        return this.dataService.send(payload);
    }

	private getReviewCourses(): Observable<CourseReview[]> {
        return this.coursesService.getCourses({
            requestKey: NetworkRequestKey.GetAdminReviewCourses,
            type: ['review'],
            id: 'AdminReview',
            fields: CoursesSelectFields.Short
        }).pipe(
            map(response => response.review),
            shareReplay(1),
        )
    }
}
