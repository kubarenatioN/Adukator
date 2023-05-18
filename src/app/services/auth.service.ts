import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { LoginResponse, User, UserRegisterData } from '../typings/user.types';
import { DataRequestPayload, DataService } from './data.service';

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

	public register(userData: UserRegisterData) {
		const key = NetworkRequestKey.RegisterUser
		const payload = NetworkHelper.createRequestPayload(
			key,
			{ body: { ...userData }, params: { reqId: key } },
		)

		return this.dataService.send<LoginResponse>(payload)
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
