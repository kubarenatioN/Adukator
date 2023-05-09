import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, filter, map, Observable, tap, throwError } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { LoginResponse, User } from '../typings/user.types';
import { DataRequestPayload, DataService } from './data.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private dataService: DataService) {}

	public login(user: { email: string; password: string }) {
		const payload: DataRequestPayload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.LoginUser,
			{ body: user }
		);
		return this.dataService.send<LoginResponse>(payload);
	}

	public register() {
		// TODO: implement
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
