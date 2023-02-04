import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../typings/user.types';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private userStore$ = new BehaviorSubject<User | null>(null);

	public user$: Observable<User | null>;

    public isAdmin$: Observable<boolean>;

	constructor() {
		this.user$ = this.userStore$.asObservable();
        this.isAdmin$ = this.user$.pipe(map(user => user !== null && user.role === 'admin'));
	}

	public setUser(user: User, token?: string) {
		this.userStore$.next(user);
        if (token) {
            this.storeUserToken(token)
        }
	}

    public clearUser(): void {
        this.userStore$.next(null)
        this.clearUserToken()
    }

    public hasUserToken(): boolean {
		return this.getUserToken() !== null;
	}

	public getUserToken(): string | null {
		return localStorage.getItem('token');
	}

	private storeUserToken(token: string) {
		localStorage.setItem('token', token);
	}

	private clearUserToken() {
		localStorage.removeItem('token');
	}
}
