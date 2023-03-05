import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseReview, StudentCourse } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
    public user$: Observable<User | null>;
    
    public studentCourses$!: Observable<StudentCourse[] | null>

    public pendingCourses$!:Observable<StudentCourse[] | null>
    public approvedCourses$!:Observable<StudentCourse[] | null>
    public rejectedCourses$!:Observable<StudentCourse[] | null>

	constructor(private userService: UserService, private router: Router, private coursesService: CoursesService) {
        this.user$ = this.userService.user$
        const studentCourses$ = this.coursesService.studentCourses$

        this.studentCourses$ = studentCourses$;
        this.pendingCourses$ = this.getCoursesByStatus('Pending')
        this.approvedCourses$ = this.getCoursesByStatus('Approved')
        this.rejectedCourses$ = this.getCoursesByStatus('Rejected')
    }

    public logOut(): void {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }

    private getCoursesByStatus(status: string) {
        return this.studentCourses$.pipe(
            map(courses => {
                if (courses === null) {
                    return null;
                }
                const filteredCourses = courses.filter(c => c.status === status)
                return filteredCourses.length > 0 ? filteredCourses : null
            })
        )
    }
}
