import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject, Subject } from 'rxjs';
import { User } from '../typings/user.types';

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

	constructor() {
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
