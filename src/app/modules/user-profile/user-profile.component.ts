import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentCoursesService } from 'src/app/services/student-courses.service';
import { UserService } from 'src/app/services/user.service';
import { User, UserTrainingProfile } from 'src/app/typings/user.types';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends CenteredContainerDirective {    
    public user$: Observable<User | null>;
    public userTrainingProfile$: Observable<UserTrainingProfile>;
    
    private userAsStudentCourses$ = this.studentCoursesService.courses$

    public studentPendingCourses$ = this.userAsStudentCourses$
    public studentApprovedCourses$ = this.userAsStudentCourses$

	constructor(private userService: UserService, private router: Router, private studentCoursesService: StudentCoursesService) {
        super();
        this.user$ = this.userService.user$
        this.userTrainingProfile$ = this.userService.trainingProfile$
    }

    public logOut(): void {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }
}
