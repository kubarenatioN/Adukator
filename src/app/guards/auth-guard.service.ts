import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	CanDeactivate,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthComponent } from '../modules/auth/auth.component';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthGuardService
	implements CanActivate
{
	constructor(private userService: UserService) {}

	public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const user$ = this.userService.user$;
		return user$.pipe(map((user) => user === null));
	}
}
