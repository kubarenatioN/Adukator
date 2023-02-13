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
		private router: Router
	) {}

	public login(user: { email: string; password: string }) {
		const payload: DataRequestPayload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.LoginUser,
			{ body: user }
		);
		this.dataService
			.send<LoginResponse>(payload)
			.subscribe(({ token, user }) => {
				this.userService.setUser(user, token);
			});
	}

	public register() {}

	public initUser(): void {
		this.getUserByToken().subscribe(
			(res) => {
				if (res !== null) {
					this.userService.setUser(res);
				}
			},
			(err) => {
				console.error('Error when getting user information...');
				this.userService.setUser(null);
			}
		);
	}

	public getUserByToken(): Observable<User | null> {
		const payload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.GetUserByToken
		);
		return this.dataService
			.send<{ user: User | null; message: string }>(payload)
			.pipe(map((res) => res.user));
	}
}
