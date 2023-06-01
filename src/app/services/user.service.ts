import { Injectable } from '@angular/core';
import {
	BehaviorSubject,
	catchError,
	filter,
	map,
	Observable,
	ReplaySubject,
	shareReplay,
	switchMap,
	tap,
	throwError,
} from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { DataResponse } from '../typings/response.types';
import { User, UserRegisterData, UserTeacherPermsRequest, UserTrainingProfile } from '../typings/user.types';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { DATA_ENDPOINTS } from '../constants/network.constants';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private _user: User | null = null;
	private userStore$ = new ReplaySubject<User | null>(1);
	private teacherPermsRequestStore$ = new BehaviorSubject<UserTeacherPermsRequest | null>(null);

	public user$: Observable<User>;
	public userToken$: Observable<User | null>;
	public trainingProfile$: Observable<UserTrainingProfile>;
	public teacherPermsRequest$: Observable<UserTeacherPermsRequest | null>;

	public get userId(): string | null {
		return this._user?.uuid ?? null;
	}

	public isAdmin$: Observable<boolean>;

	public get token(): string | null {
		return this.getUserToken();
	}

	constructor(
		private dataService: DataService,
		private authService: AuthService
	) {
		this.user$ = this.userStore$.asObservable().pipe(filter(Boolean));
		this.userToken$ = this.userStore$.asObservable();
		this.isAdmin$ = this.user$.pipe(
			map((user) => user !== null && user.role === 'admin')
		);
		this.trainingProfile$ = this.user$.pipe(
			switchMap((user) => {
				return this.dataService.http.get<{
					profile: UserTrainingProfile;
				}>(`${DATA_ENDPOINTS.root}/user/training/${user._id}`);
			}),
			map((res) => res.profile),
			shareReplay(1)
		);
		this.teacherPermsRequest$ = this.teacherPermsRequestStore$.asObservable().pipe(shareReplay(1))
	}

	public initUser() {
		return new Promise((resolve, rej) => {
			this.authService.getUserByToken().subscribe(res => {
				const { user, refreshToken } = res
				this.setUser(user, refreshToken);
				resolve(res)
			});
		})
	}

	public getTeacherPermsRequest() {
		this.user$.pipe(
			switchMap(user => {
				return this.dataService.http.get<{ request: UserTeacherPermsRequest | null }>(`${DATA_ENDPOINTS.user}/become-teacher/${user._id}`)
			}),
			map(res => res.request)
		).subscribe(request => {
			this.teacherPermsRequestStore$.next(request)
		})
	}

	public cancelTeacherPermsRequest(reqId: string) {
		this.dataService.http.delete<{ request: null }>(`${DATA_ENDPOINTS.user}/become-teacher/${reqId}`).pipe(
			map(res => res.request)
		).subscribe(request => {
			this.teacherPermsRequestStore$.next(request)
		})
	}

	public login(user: { email: string; password: string }) {
		return this.authService.login(user).pipe(
			catchError((err) => {
				this.setUser(null, '');
				return throwError(err);
			}),
			tap(({ token, user }) => {
				this.setUser(user, token);
			})
		);
	}

	public register(userData: UserRegisterData) {
		return this.authService.register(userData).pipe(
			catchError((err) => {
				this.setUser(null, '');
				return throwError(() => new Error(err.message));
			}),
			tap(({ token, user }) => {
				this.setUser(user, token);
			})
		)
	}

	public setUser(user: User | null, token?: string) {
		this.userStore$.next(user);
		if (token) {
			this.storeUserToken(token);
		}
	}

	public logout() {
		this.clearUser();
	}

	public getUserById(userId: string): Observable<User | null> {
		const payload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.GetUserById,
			{
				urlId: userId,
			}
		);

		return this.dataService
			.send<{ user: User | null }>(payload)
			.pipe(map((res) => res.user));
	}

	private clearUser(): void {
		this.userStore$.next(null);
		this.clearUserToken();
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

	private clearUserToken() {
		localStorage.removeItem('token');
	}
}
