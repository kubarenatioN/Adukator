import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { Course, CourseMembershipMap, CourseMembershipStatus as EnrollStatus } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-course-management',
	templateUrl: './course-management.component.html',
	styleUrls: ['./course-management.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent extends CenteredContainerDirective implements OnInit {
    private courseMembershipStore$ = new BehaviorSubject<CourseMembershipMap>({
        pending: [],
        approved: [],
        rejected: [],
    })
    private courseId!: string;

    public course$!: Observable<Course | null>
    
    public get approvedStudents$(): Observable<User[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.approved),
            shareReplay(1),
        )
    }
    
    public get pendingStudents$(): Observable<User[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.pending),
            shareReplay(1),
        )
    }
    
    public get rejectedStudents$(): Observable<User[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.rejected),
            shareReplay(1),
        )
    }

	constructor(
        private activatedRoute: ActivatedRoute, 
        private courseManagement: CourseManagementService,
        private teacherCourses: TeacherCoursesService
    ) {
        super();
    }

	public ngOnInit(): void {
        this.course$ = combineLatest([
            this.activatedRoute.paramMap,
            this.teacherCourses.courses$,
        ]).pipe(
            take(1),
            map(([params, teacherCourses]) => {
                const id = String(params.get('id'));
                if (id) {
                    this.courseId = id;
                    const course = teacherCourses?.published?.find(course => course.uuid === id)
                    return course ? course : null
                }
                return null
            }),
            tap(course => {
                if (course) {
                    this.courseId = course.uuid;
                    this.getInitialMembers(this.courseId);
                }
            }),
            shareReplay(1),
        )
    }

    public getInitialMembers(courseId: string) {
        combineLatest([
            this.courseManagement.getCourseMembers({
                type: 'list',
                status: EnrollStatus.Pending,
                courseId,
                size: 10,
                page: 0,
            }),
            this.courseManagement.getCourseMembers({
                type: 'list',
                status: EnrollStatus.Approved,
                courseId,
                size: 10,
                page: 0,
            }),
        ])
        .subscribe(([pending, approved]) => {
            const store = this.courseMembershipStore$.value;
            this.courseMembershipStore$.next({
                pending: pending,
                approved: approved,
                rejected: store.rejected,
            });
        })
    }

    public onApproveEnroll(userId: string) {
        this.courseManagement.setCourseMembershipStatus([userId], this.courseId, EnrollStatus.Approved).subscribe()
    }

    public onExpel(userId: string) {
        this.courseManagement.setCourseMembershipStatus([userId], this.courseId, EnrollStatus.Rejected).subscribe()
    }

    public refreshMembersList(status: keyof CourseMembershipMap): void {
        if (!this.courseId) {
            throw new Error('No course ID was provided');
        }
        
    }
}
