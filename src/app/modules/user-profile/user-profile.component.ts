import { ChangeDetectionStrategy, Component, Host, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { StudentCoursesService } from 'src/app/services/student-courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseReview, StudentCourse } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends CenteredContainerDirective {    
    public user$: Observable<User | null>;
    
    public userAsStudentCourses$!: Observable<Course[] | null>
    public userAsTeacherCourses$!: Observable<Course[] | null>

	constructor(private userService: UserService, private router: Router, private studentCoursesService: StudentCoursesService, private teacherCoursesService: TeacherCoursesService) {
        super();
        this.user$ = this.userService.user$
        this.userAsStudentCourses$ = this.studentCoursesService.courses$;
        
    }

    public logOut(): void {
        this.userService.logout()
        this.router.navigate(['/auth'])
    }
}
