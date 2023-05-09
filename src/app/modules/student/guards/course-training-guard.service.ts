import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { map, switchMap } from 'rxjs';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UserService } from 'src/app/services/user.service';

@Injectable()
export class CourseTrainingGuardService implements CanActivate {
	private redirect;
	constructor(
		private trainingDataService: TrainingDataService,
		private userService: UserService,
		router: Router
	) {
		this.redirect = router.parseUrl('/app/learn/catalog');
	}

	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
		const trainingId = route.paramMap.get('id');
		if (!trainingId) {
			return this.redirect;
		}
		return this.userService.user$.pipe(
			switchMap((user) => {
				return this.trainingDataService.checkTrainingAccess({
					trainingUUId: trainingId,
					userId: user._id,
				});
			}),
			map((res) => {
				console.log('profile:', res);
				return res.hasAccess;
			})
		);
	}
}
