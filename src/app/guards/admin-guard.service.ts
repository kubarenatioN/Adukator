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
	): Observable<boolean> {
		return this.userService.isAdmin$.pipe(
            tap(isAdmin => {
                if (!isAdmin) {
                    this.router.navigateByUrl('/');
                }
            })
        );
	}
}
