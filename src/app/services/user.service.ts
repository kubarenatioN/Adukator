import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../typings/user.types';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private userStore$ = new BehaviorSubject<User | null>(null);

	public user$: Observable<User | null>;

	constructor() {
		this.user$ = this.userStore$.asObservable();
	}

	public setUser(user: User | null) {
		this.userStore$.next(user);
	}
}
