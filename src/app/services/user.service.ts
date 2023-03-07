import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject, Subject } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course } from '../typings/course.types';
import { DataResponse } from '../typings/response.types';
import { User } from '../typings/user.types';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	// private userStore$ = new Subject<User | null>();
	private userStore$ = new ReplaySubject<User | null>(1);

	public user$: Observable<User | null>;

    public isAdmin$: Observable<boolean>;

    public get token() : string | null {
        return this.getUserToken()
    }

    public get role$() {
        return this.user$.pipe(map(user => user?.role ?? ''))
    }

	constructor(private dataService: DataService) {
		this.user$ = this.userStore$.asObservable();
        this.isAdmin$ = this.user$.pipe(map(user => user !== null && user.role === 'admin'));
	}

	public setUser(user: User | null, token?: string) {
		this.userStore$.next(user);
        if (token) {
            this.storeUserToken(token)
        }
	}

    public logout() {
        this.clearUser();
    }

    public isCourseOwner(course: Course): Observable<boolean> {
        return this.user$.pipe(map(user => user?.role === 'teacher' && user?.id === course.authorId))
    }

    public getUserById(userId: number): Observable<User | null> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.GetUserById, {
            urlId: userId
        })
        return this.dataService.send<DataResponse<User | null>>(payload).pipe(map(res => res.data));
    }

    private clearUser(): void {
        this.userStore$.next(null)
        this.clearUserToken()
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
