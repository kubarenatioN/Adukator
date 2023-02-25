import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { CourseReview } from '../typings/course.types';
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

    public publish(id: number) {
        console.log('111 publish course with ID', id);
    }

	private getReviewCourses(): Observable<CourseReview[]> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetAllAdminReviewCourses)
        return this.dataService.send<CourseReview[]>(payload).pipe(
            shareReplay(1),
        )
    }
}
