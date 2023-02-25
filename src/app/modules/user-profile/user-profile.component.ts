import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseReview } from 'src/app/typings/course.types';
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
    public userCoursesOnReview$!: Observable<CourseReview[]>

	constructor(private userService: UserService, private router: Router, private coursesService: CoursesService) {
        this.user$ = this.userService.user$
        const userCourses = this.coursesService.userCourses$

        this.userCourses$ = userCourses.pipe(
            map(courses => courses?.published ?? [])
        )

        this.userCoursesOnReview$ = userCourses.pipe(
            map(courses => {
                if (courses?.review) {
                    return courses.review.filter(course => course.parentId === null)
                }
                return []
            }),
        )
    }

    public logOut(): void {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }
}
