import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class AppGuardService implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
		const user$ = this.userService.user$;
		return user$.pipe(map((user) => {
            const hasUser = user !== null
            if (hasUser) {
                return true
            }
            return this.router.parseUrl('/auth/login')
        }));
	}
}
