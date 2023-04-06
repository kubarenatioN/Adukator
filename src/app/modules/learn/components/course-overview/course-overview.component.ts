import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, Subscription, switchMap, throwError, withLatestFrom, combineLatest, shareReplay } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { ConfigService } from 'src/app/services/config.service';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseMembershipAction, CourseModule } from 'src/app/typings/course.types';
import { CoursesSelectResponse } from 'src/app/typings/response.types';

@Component({
	selector: 'app-course-overview',
	templateUrl: './course-overview.component.html',
	styleUrls: ['./course-overview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent {
    private enrollmentSub?: Subscription
    private courseEnrollTrigger$ = new BehaviorSubject<void>(undefined);

    public course$: Observable<Course | null>;

    public modules$: Observable<CourseModule[]>

    public canEnroll$: Observable<boolean>;
    public isEnrolled$: Observable<boolean>;
    public enrollStatus$: Observable<string | null>;
    public isUserOwner$: Observable<boolean>;

    public isDisabledEnrollActions = false;
    
	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService, private configService: ConfigService, private userService: UserService, private courseManagement: CourseManagementService) {
        this.course$ = this.activatedRoute.paramMap.pipe(
            switchMap(paramMap => {
                const id = String(paramMap.get('id'))
                if (id) {
                    return this.coursesService.getCourses<CoursesSelectResponse>({
                        reqId: 'OverviewCourse',
                        type: ['published'],
                        fields: CoursesSelectFields.Full,
                        coursesIds: [id]
                    });
                }
                return of(null);
            }),
            map(res => res ? res.published[0] : null),
            shareReplay(1),
        );

        this.modules$ = this.course$.pipe(
            map(course => course ? course.modules : [])
        )
        
        this.isUserOwner$ = this.course$.pipe(
            switchMap(course => {
                if (course) {
                    return this.userService.isCourseOwner(course)
                }
                return of(false);
            }),
        )
            
        this.canEnroll$ = this.userService.user$.pipe(
            withLatestFrom(this.isUserOwner$),
            map(([user, isOwner]) => {
                return user?.role !== 'admin' && !isOwner
            })
        )

        const courseEnrollmentStatus$ = combineLatest([
            this.courseEnrollTrigger$.asObservable(),
            this.course$,
            this.userService.user$,
        ]).pipe(
            switchMap(([_, course, user]) => {
                if (course && user) {
                    return this.courseManagement.lookupEnrollment([user.id], course.uuid)
                }
                return of(null);
            }),
            withLatestFrom(this.userService.user$),
            map(([result, user]) => {
                if (result === null) {
                    return null;
                }
                const { data, action } = result
                const userEnrollmentIndex = data.findIndex(record => record.userId == user?.id)
                if (action === 'lookup' && userEnrollmentIndex !== -1) {
                    return data[userEnrollmentIndex].status;
                }
                return null;
            }),
            shareReplay(1),
        )

        this.enrollStatus$ = courseEnrollmentStatus$
        this.isEnrolled$ = this.enrollStatus$.pipe(
            map(status => status !== null)
        )
    }

    public enrollCourse(courseId: string): void {
        this.makeCourseEnrollAction(courseId, 'enroll')
    }

    public cancelCourseEnroll(courseId: string): void {
        this.makeCourseEnrollAction(courseId, 'cancel')
    }

    public leaveCourse(courseId: string) {
        this.makeCourseEnrollAction(courseId, 'leave')
    }

    private makeCourseEnrollAction(courseId: string, action: CourseMembershipAction): void {
        this.isDisabledEnrollActions = true;
        if(this.enrollmentSub && !this.enrollmentSub.closed) {
            return;
        }
        this.enrollmentSub = this.userService.user$
            .pipe(
                switchMap(user => {
                    if (user) {
                        return this.courseManagement.updateEnrollment([user.id], courseId, action)
                    }
                    return throwError(() => new Error('No user'))
                }),
                catchError(err => {
                    return throwError(() => new Error(err.error.message))
                }),
            )
            .subscribe({
                next: (res) => {
                    console.log('Perform course enroll action', res);
                    this.courseEnrollTrigger$.next();
                    this.enrollmentSub?.unsubscribe()
                    this.isDisabledEnrollActions = false;
                },
                error: (err) => {
                    console.warn(err);
                    this.enrollmentSub?.unsubscribe()
                    this.isDisabledEnrollActions = false;
                }
            })
    }
}
