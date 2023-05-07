import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { map, of, switchMap, withLatestFrom } from 'rxjs';
import { CoursesService } from '../services/courses.service';
import { UserService } from '../services/user.service';
import { TeacherTrainingService } from '../modules/teacher/services/teacher-training.service';

@Injectable({
	providedIn: 'root',
})
export class CourseReviewGuardService implements CanActivate {
	constructor(private userService: UserService, private teacherCourses: TeacherTrainingService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
        const courseId = String(route.paramMap.get('id'))        

        return this.userService.isAdmin$.pipe(
            switchMap(isAdmin => {
                if (isAdmin) {
                    return of(true)
                }
                return this.isTeacherAuthor(courseId)
            }),
            map(isTeacherAuthor => {
                return isTeacherAuthor ? true : this.router.parseUrl('/app/learn')
            })
        )
    }

    private isTeacherAuthor(courseId: string) {
        return this.teacherCourses.review$.pipe(
            withLatestFrom(this.userService.user$),
            map(([reviewCourses, user]) => {
                const courseForReview = reviewCourses.find(course => course.uuid === courseId)
                return courseForReview?.authorId === user?.uuid
            })
        )
    }
}
