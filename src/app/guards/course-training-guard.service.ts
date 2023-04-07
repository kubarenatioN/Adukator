import { Injectable } from '@angular/core';
import {
	ActivatedRoute,
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { map, Observable, of, switchMap, withLatestFrom } from 'rxjs';
import { CoursesService } from '../services/courses.service';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class CourseTrainingGuardService implements CanActivate {
	private redirect;
	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private coursesService: CoursesService,
		private router: Router
	) {
		this.redirect = router.parseUrl('/app/learn/catalog');
	}

	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
		const courseId = route.paramMap.get('id');
		if (!courseId) {
			return this.redirect;
		}
		return this.isTrainingAvailable(courseId);
	}

	private isTrainingAvailable(courseId: string) {
		return this.userService.user$.pipe(
			switchMap((user) => {
				return this.coursesService.isTrainingCourseAvailable(
					courseId,
					user.uuid
				);
			}),
			map((isAvailable) => {
				return isAvailable ? true : this.redirect;
			})
		);
	}
}
