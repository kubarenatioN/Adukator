import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class TeacherGuardService implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

    public canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.isTeacher();
    }

    private isTeacher(): Observable<boolean | UrlTree> {
        return this.userService.user$.pipe(
            map(user => {
                if (user.permission === 'teacher') {
                    return true;
                }
                return this.router.parseUrl('/app');
            })
        )
    }
}
