import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
    public user$: Observable<User | null>;
    public userCourses$!: Observable<Course[]>
    public userCoursesOnReview$!: Observable<Course[]>

	constructor(private userService: UserService, private router: Router, private coursesService: CoursesService) {
        this.user$ = this.userService.user$
        const userCourses = this.coursesService.userCourses$

        this.userCourses$ = userCourses.pipe(
            map(courses => courses?.published ?? [])
        )

        this.userCoursesOnReview$ = userCourses.pipe(
            map(courses => courses?.review ?? [])
        )
    }

    public logOut() {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }
}
