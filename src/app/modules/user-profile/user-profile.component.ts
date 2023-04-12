import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentCoursesService } from 'src/app/services/student-courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { UserService } from 'src/app/services/user.service';
import { CourseMembershipStatus } from 'src/app/typings/course.types';
import { Training } from 'src/app/typings/training.types';
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

    public studentPendingCourses$ = this.userAsStudentCourses$
    public studentApprovedCourses$ = this.userAsStudentCourses$

	constructor(private userService: UserService, private router: Router, private studentCoursesService: StudentCoursesService, private teacherCoursesService: TeacherCoursesService) {
        super();
        this.user$ = this.userService.user$
        
    }

    public logOut(): void {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }
}
