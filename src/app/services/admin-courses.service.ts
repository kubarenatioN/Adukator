import { Injectable } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { convertCourseFormDataToCourseReview, stringify } from '../helpers/courses.helper';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseEditorComments, CourseFormData, CourseReview } from '../typings/course.types';
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
        return this.dataService.send<CourseReview>(payload)
    }

    public publish(course: Course, masterId: number): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.PublishCourse, {
            body: { course, masterId },
        });
        return this.dataService.send(payload);
    }

    public saveCourseReview(id: number, comments: string): Observable<unknown> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.UpdateCourseReview, {
            body: { id, comments }
        })
        return this.dataService.send(payload);
    }

	private getReviewCourses(): Observable<CourseReview[]> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllAdminReviewCourses)
        return this.dataService.send<CourseReview[]>(payload).pipe(
            shareReplay(1),
        )
    }
}
