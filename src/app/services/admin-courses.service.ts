import { Injectable } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { convertCourseFormDataToCourseReview, stringify } from '../helpers/courses.helper';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { CourseEditorComments, CourseFormData, CourseReview } from '../typings/course.types';
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

    public createCourseReviewVersion(formData: CourseFormData, { isParent }: { isParent: boolean }): Observable<unknown> {
        console.log('111 formData', formData);
        
        const courseData = convertCourseFormDataToCourseReview(formData);
        courseData.editorCommentsJson = null;

        // TODO: delegate hadling of this logic to smarter typings & converters
        courseData.createdAt = undefined;

        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.CreateCourse, {
            body: { course: courseData, isParent }
        })
        return this.dataService.send<unknown>(payload)
    }

    public publish(id: number) {
        console.log('111 publish course with ID', id);
    }

    public saveCourseReview(courseForm: CourseFormData): Observable<unknown> {
        const comments = stringify(courseForm.editorComments);
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.UpdateCourseReview, {
            body: { id: courseForm.id, comments }
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
