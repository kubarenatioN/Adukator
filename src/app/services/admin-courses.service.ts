import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseReview } from '../typings/course.types';
import {
	CoursesResponse,
	CoursesSelectResponse,
} from '../typings/response.types';
import { CoursesService } from './courses.service';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class AdminCoursesService {
	public reviewCoursesList$: Observable<CourseReview[]>;

	constructor(
		private dataService: DataService,
		private coursesService: CoursesService
	) {
		this.reviewCoursesList$ = this.getReviewCourses().pipe(
			map((courses) => courses.filter((course) => !course.masterId))
		);
	}

	// get any course under review by id
	public getCourseReviewVersion(id: string): Observable<CourseReview> {
		return this.coursesService.getCourseReviewVersion(id);
	}

	public publish(course: Course, masterId: string): Observable<unknown> {
		const payload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.PublishCourse,
			{
				body: { course, masterId },
				params: { reqId: 'PublishCourse' },
			}
		);
		return this.dataService.send(payload);
	}

	public saveCourseReview(
		id: string,
		comments: { overallComments: unknown; modules: unknown }
	): Observable<unknown> {
		const payload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.UpdateCourseReview,
			{
				body: { id, comments },
				params: { reqId: 'UpdateCourseReview' },
			}
		);
		return this.dataService.send(payload);
	}

	private getReviewCourses(): Observable<CourseReview[]> {
		return this.coursesService
			.getCourses<{ data: CourseReview[] }>({
				requestKey: NetworkRequestKey.GetAdminReviewCourses,
				type: 'review',
				reqId: 'AdminReview',
				fields: CoursesSelectFields.Short,
			})
			.pipe(
				map((response) => response.data),
				shareReplay(1)
			);
	}
}
