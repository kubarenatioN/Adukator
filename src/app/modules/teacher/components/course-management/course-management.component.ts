import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, combineLatestWith, filter, map, merge, Observable, of, shareReplay, Subject, switchMap, tap, throwError } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { Course, CourseEnrollAction, CourseMembers, CourseMembersMap, GetCourseMembersParams } from 'src/app/typings/course.types';
import { CourseEnrollResponseData } from 'src/app/typings/response.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-course-management',
	templateUrl: './course-management.component.html',
	styleUrls: ['./course-management.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent extends CenteredContainerDirective implements OnInit {
    private membersStore$: BehaviorSubject<CourseMembers> = new BehaviorSubject({} as CourseMembers);
    private courseId!: number;
    private membersStoreRefresher$ = new Subject<{
        id: keyof CourseMembers;
        members: User[];
    }>()

    public course$: Observable<Course | null>
    public pendingStudents$: Observable<User[] | null>; 
    public approvedStudents$: Observable<User[] | null>; 
    public rejectedStudents$: Observable<User[] | null>; 

	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {
        super();
        this.course$ = combineLatest([
            this.activatedRoute.paramMap,
            this.coursesService.teacherUserCourses$,
        ]).pipe(
            map(([params, teacherCourses]) => {
                const id = Number(params.get('id'));
                if (id) {
                    this.courseId = id;
                    const course = teacherCourses?.published?.find(course => course.id === id)
                    return course ? course : null
                }
                return null
            }),
            shareReplay(1),
        )

        this.course$.pipe(
            switchMap(course => {
                if (course === null) {
                    return of(null);
                }
                return this.requestMembers({
                    type: 'list',
                    status: ['Approved', 'Pending', 'Rejected'].join(','),
                    size: 10,
                    page: 0,
                    courseId: course.id,
                })       
            }),
        ).subscribe(data => {
            if (data) {
                this.membersStore$.next(data);
            }
        })

        this.pendingStudents$ = this.getCourseMemberByStatus('pending'),
        this.approvedStudents$ = this.getCourseMemberByStatus('approved')
        this.rejectedStudents$ = this.getCourseMemberByStatus('rejected')
    }

	public ngOnInit(): void {
        
    }

    public onApproveEnroll(userId: number) {
        this.makeCourseEnrollAction(userId, this.courseId, 'approve')
    }

    public onExpel(userId: number) {

    }

    public refreshMembersList(status: keyof CourseMembers): void {
        if (isNaN(this.courseId)) {
            throw new Error('No course ID was provided');
        }
        this.requestMembers({
            type: 'list',
            status: CourseMembersMap[status], // case important here
            size: 10,
            page: 0,
            courseId: this.courseId
        }).subscribe(res => {
            const data = res[status]
            this.setMembersForStatus(status, data);
        })
    }

    private getCourseMemberByStatus(status: keyof CourseMembers) {
        return this.membersStore$.pipe(
            map(students => {
                if (students === null) {
                    return null;
                }
                return students[status] 
            })
        )
    }

    private getMembersStoreRefresher(id: keyof CourseMembers) {
        return this.membersStoreRefresher$.pipe(
            filter(update => update.id === id),
            map(data => data.members)
        )
    }

    private makeCourseEnrollAction(userId: number, courseId: number, action: CourseEnrollAction): void {
        this.coursesService.makeCourseEnrollAction([userId], courseId, action)
        .pipe(
            catchError(err => {
                return throwError(() => new Error(err.error.message))
            }),
        )
        .subscribe({
            next: (res) => {
                console.log('Perform course enroll action', res);
                this.updateMembersList(res.data, res.action)
            },
            error: (err) => {
                console.warn(err);
            }
        })
    }

    private updateMembersList(data: CourseEnrollResponseData[], action: CourseEnrollAction) {
        const userIds = data.map(record => record.userId);
        const store = this.membersStore$.value
        if (action === 'approve') {
            const affectedMembers = store.pending.filter(user =>  userIds.includes(user.id))

            console.log(affectedMembers);
            
            const approveUpdate = store.approved.concat(affectedMembers);
            const pendingUpdate = store.pending.filter(user =>  !userIds.includes(user.id))

            const update = {
                ...store,
                // approved: approveUpdate,
                pending: pendingUpdate
            }
            this.membersStore$.next(update);
        }
    }

    private setMembersForStatus(status: keyof CourseMembers, members: User[]) {
        const store = this.membersStore$.value;
        this.membersStore$.next({
            ...store,
            [status]: members
        })
    }

    private requestMembers(params: GetCourseMembersParams) {
        return this.coursesService.getCourseMembers(params);
    }
}
