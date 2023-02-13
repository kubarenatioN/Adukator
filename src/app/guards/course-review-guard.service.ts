import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { combineLatest, map, Observable, of, switchMap, take, withLatestFrom } from 'rxjs';
import { CoursesService } from '../services/courses.service';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class CourseReviewGuardService implements CanActivate {
	constructor(private userService: UserService, private coursesService: CoursesService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
        const courseId = Number(route.paramMap.get('id'))        

        return this.userService.isAdmin$.pipe(
            switchMap(isAdmin => {
                if (isAdmin) {
                    return of(true)
                }
                return this.isTeacherAuthor(courseId)
            }),
        )
    }

    private isTeacherAuthor(courseId: number) {
        return this.coursesService.userCourses$.pipe(
            withLatestFrom(this.userService.user$),
            map(([courses, user]) => {
                const courseForReview = courses?.review?.find(course => course.id === courseId)
                if (!courseForReview) {
                    const publishedCourse = courses?.published?.find(course => course.id === courseId)
                    if (publishedCourse) {
                        return this.router.parseUrl(`/app/learn/course/overview/${publishedCourse.id}`)
                    }
                    return this.router.parseUrl(`/app/learn/catalog`)
                }
                return courseForReview?.authorId === user?.id
            })
        )
    }
}
