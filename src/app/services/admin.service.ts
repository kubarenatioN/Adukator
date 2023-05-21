import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CourseReview } from '../typings/course.types';
import { AdminCoursesService } from './admin-courses.service';
import { DataService } from './data.service';
import { DATA_ENDPOINTS } from '../constants/network.constants';
import { UserTeacherPermsRequest, UserTeacherPermsRequestStatus } from '../typings/user.types';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
	public reviewCoursesList$: Observable<CourseReview[]>;

	constructor(private adminCoursesService: AdminCoursesService, private dataService: DataService) {
		this.reviewCoursesList$ = this.adminCoursesService.reviewCoursesList$;
	}

	public getUserTeacherPermsRequests() {
		return this.dataService.http.get<{ data: UserTeacherPermsRequest[] }>(`${DATA_ENDPOINTS.user}/become-teacher`)
			.pipe(map(res => res.data))
	}

	public udpdateTeacherPermsRequest(id: string, payload: { status: UserTeacherPermsRequestStatus }) {
		return this.dataService.http.patch<{ token?: string }>(`${DATA_ENDPOINTS.user}/become-teacher/${id}`, payload)
	}
}
