import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, Subject } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { CoursesService } from 'src/app/services/courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { Course, CourseMembership, CourseMembershipSearchParams } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-course-management',
	templateUrl: './course-management.component.html',
	styleUrls: ['./course-management.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent extends CenteredContainerDirective implements OnInit {
    private courseId!: string;

    public course$: Observable<Course | null>
    public pendingStudents$: Observable<User[] | null>; 
    public approvedStudents$: Observable<User[] | null>; 
    public rejectedStudents$: Observable<User[] | null>; 

	constructor(
        private activatedRoute: ActivatedRoute, 
        private courseManagement: CourseManagementService,
        private teacherCourses: TeacherCoursesService
    ) {
        super();
        this.course$ = combineLatest([
            this.activatedRoute.paramMap,
            this.teacherCourses.courses$,
        ]).pipe(
            map(([params, teacherCourses]) => {
                const id = String(params.get('id'));
                if (id) {
                    this.courseId = id;
                    const course = teacherCourses?.published?.find(course => course.uuid === id)
                    return course ? course : null
                }
                return null
            }),
            shareReplay(1),
        )

        this.pendingStudents$ = this.courseManagement.pendingStudents$
        this.approvedStudents$ = this.courseManagement.approvedStudents$
        this.rejectedStudents$ = this.courseManagement.rejectedStudents$
    }

	public ngOnInit(): void {
        
    }

    public onApproveEnroll(userId: number) {
        this.courseManagement.setCourseMembershipStatus([userId], this.courseId, 'approved')
    }

    public onExpel(userId: number) {

    }

    public refreshMembersList(status: keyof CourseMembership): void {
        if (!this.courseId) {
            throw new Error('No course ID was provided');
        }
        
    }

    private requestMembers(params: CourseMembershipSearchParams) {
        return this.courseManagement.getCourseMembers(params);
    }
}
