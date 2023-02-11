import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { delay, map, Observable, tap } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class AdminGuardService implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}
	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	) {
		return this.userService.isAdmin$.pipe(
            map(isAdmin => {
                if (!isAdmin) {
                    return this.router.parseUrl('/app')
                }
                return true
            })
        );
	}
}
