import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, ReplaySubject, Subject, switchMap } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { Course } from '../typings/course.types';
import { DataResponse } from '../typings/response.types';
import { User } from '../typings/user.types';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private userStore$ = new BehaviorSubject<User | null>(null);

	public user$: Observable<User>;

    public get hasUser$(): Observable<boolean> {
        return this.userStore$.pipe(map(user => user !== null))
    }

    public get userId(): number | null {
        return this.userStore$.value?.uuid ?? null
    }

    public isAdmin$: Observable<boolean>;

    public get token() : string | null {
        return this.getUserToken()
    }

    public get role$() {
        return this.user$.pipe(map(user => user?.role ?? ''))
    }

	constructor(private dataService: DataService, private authService: AuthService) {
		this.user$ = this.userStore$.asObservable().pipe(filter(Boolean));
        this.isAdmin$ = this.user$.pipe(map(user => user !== null && user.role === 'admin'));
	}

    public initUser() {
		this.authService.getUserByToken().subscribe(user => {
            this.setUser(user)
        })
	}

    public login(user: { email: string; password: string }) {
        this.authService.login(user)
        .subscribe(({ token, user }) => {
            this.setUser(user, token);
        });
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
        return this.user$.pipe(map(user => user?.role === 'teacher' && user?.uuid === course.authorId))
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
