import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class AdminGuardService implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}
	public canActivate() {
		return this.isAdmin();
	}

	private isAdmin() {
		return this.userService.isAdmin$.pipe(
			map((isAdmin) => {
				if (!isAdmin) {
					return this.router.parseUrl('/app');
				}
				return true;
			})
		);
	}
}
