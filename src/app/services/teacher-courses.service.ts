import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { TeacherCourses } from '../typings/course.types';
import { CoursesSelectResponse } from '../typings/response.types';
import { CoursesService } from './courses.service';
import { DataService } from './data.service';
import { UserService } from './user.service';

const RequestKey = NetworkRequestKey.GetCourses

@Injectable({
	providedIn: 'root',
})
export class TeacherCoursesService {
    public courses$: Observable<TeacherCourses | null>
    
	constructor(private dataService: DataService, private userService: UserService, private coursesService: CoursesService) {
        this.courses$ = this.getCourses();
    }

    public getCourseReviewVersion(courseId: string) {
        return this.coursesService.getCourseReviewVersion(courseId);   
    }

    private getCourses() {
        return this.userService.user$.pipe(
            switchMap(user => {
                return this.coursesService.getCourses<TeacherCourses>({
                    requestKey: RequestKey,
                    reqId: 'TeacherReviewCourses',
                    type: 'review',
                    authorId: user.uuid,
                    fields: CoursesSelectFields.Short
                })
            }),
            shareReplay(1),
        )
    }
}
