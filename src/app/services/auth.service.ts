import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { first, map, Observable, take, tap } from 'rxjs';
import { DATA_ENDPOINTS } from '../constants/network.constants';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { LoginResponse, User } from '../typings/user.types';
import { DataRequestPayload, DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(
		private dataService: DataService,
		private userService: UserService,
        private router: Router,
	) {	}

	public login(user: { email: string; password: string }): Observable<User> {
		const payload: DataRequestPayload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.LoginUser,
			user
		);
		return this.dataService.send<LoginResponse>(payload).pipe(
			tap(({ token, user }) => {
				this.userService.setUser(user, token);
			}),
			map((res) => res.user)
		);
	}

	public register() {}

	public logOut() {
		this.userService.clearUser();
	}

	public initUser(): void {
		this.getUserByToken().subscribe((res) => {
            if (res !== null) {
                this.userService.setUser(res)
                this.router.navigateByUrl('/app')
            }
        }, (err) => {
            this.router.navigateByUrl('/auth')
        });
	}

	private getUserByToken(): Observable<User | null> {
		const payload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.GetUserByToken
		);
		return this.dataService
			.send<{ user: User | null; message: string }>(payload)
			.pipe(map((res) => res.user));
	}
}
