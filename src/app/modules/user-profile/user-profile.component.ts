import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentCoursesService } from 'src/app/services/student-courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { UserService } from 'src/app/services/user.service';
import { CourseMembershipStatus, StudentCourse } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends CenteredContainerDirective {    
    public user$: Observable<User | null>;
    
    private userAsStudentCourses$ = this.studentCoursesService.courses$
    private userAsTeacherCourses$!: Observable<StudentCourse[] | null>

    public studentPendingCourses$ = this.userAsStudentCourses$.pipe(
        map(membership => membership.filter(item => item.status === CourseMembershipStatus.Pending).map(membership => membership.course)),
    )

    public studentApprovedCourses$ = this.userAsStudentCourses$.pipe(
        map(membership => membership.filter(item => item.status === CourseMembershipStatus.Approved).map(membership => membership.course))
    )

	constructor(private userService: UserService, private router: Router, private studentCoursesService: StudentCoursesService, private teacherCoursesService: TeacherCoursesService) {
        super();
        this.user$ = this.userService.user$
        
    }

    public logOut(): void {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }
}
