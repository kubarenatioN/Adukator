import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { first, map, Observable, take, tap } from 'rxjs';
import { LoginResponse, User } from '../typings/user.types';
import {
	DataRequestPayload,
	DataService,
	DATA_ENDPOINTS,
} from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(
		private dataService: DataService,
		private userService: UserService,
		private router: Router
	) {
		this.initUser();
	}

	public login(user: { email: string; password: string }): Observable<User> {
		const payload: DataRequestPayload = {
			method: 'POST',
			url: `${DATA_ENDPOINTS.auth.login}`,
			body: {
				...user,
			},
		};
		return this.dataService.send<LoginResponse>(payload).pipe(
			tap(({ token, user }) => {
				this.storeUserToken(token);
				this.userService.setUser(user);
			}),
			map((res) => res.user)
		);
	}

	public hasUserToken(): boolean {
		return this.getUserToken() !== null;
	}

	private getUserToken(): string | null {
		return localStorage.getItem('token');
	}

	private storeUserToken(token: string) {
		localStorage.setItem('token', token);
	}

	private initUser(): void {
		const token = this.getUserToken();
		if (token) {
			this.getUserByToken(token)
				.pipe(take(1))
				.subscribe((res) => this.userService.setUser(res));
		} else {
			this.userService.setUser(null);
		}
	}

	private getUserByToken(token: string): Observable<User | null> {
		const payload: DataRequestPayload = {
			method: 'POST',
			url: `${DATA_ENDPOINTS.auth.user}`,
			headers: new HttpHeaders({
				Authorization: token,
			}),
		};
		return this.dataService
			.send<{ user: User | null; message: string }>(payload)
			.pipe(map((res) => res.user));
	}
}
