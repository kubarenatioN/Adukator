import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, map, merge, Observable, of, shareReplay, Subject, Subscription, switchMap, throwError, withLatestFrom } from 'rxjs';
import { parseModules } from 'src/app/helpers/courses.helper';
import { ConfigService } from 'src/app/services/config.service';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseModule } from 'src/app/typings/course.types';

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
    
	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService, private configService: ConfigService, private userService: UserService) {
        this.course$ = this.activatedRoute.paramMap.pipe(
            switchMap(paramMap => {
                const id = paramMap.get('id')
                if (id) {
                    return this.coursesService.getCourseById(Number(id));
                }
                return of(null);
            }),
            shareReplay(1),
        );

        this.modules$ = this.course$.pipe(
            map(course => course ? parseModules(course.modulesJson) : [])
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

        const courseEnrollmentStatus$ = this.courseEnrollTrigger$
            .asObservable()
            .pipe(
                switchMap(() => this.course$),
                switchMap(course => {
                    if (course) {
                        return this.coursesService.makeCourseEnrollAction(course.id, 'lookup')
                    }
                    return of(null);
                }),
                withLatestFrom(this.userService.user$),
                map(([result, user]) => {
                    if (result === null) {
                        return null;
                    }
                    const { data, action } = result
                    const userEnrollmentIndex = data.findIndex(record => record.userId === user?.id)
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

    public enrollCourse(courseId: number): void {
        if(this.enrollmentSub && !this.enrollmentSub.closed) {
            return;
        }
        this.enrollmentSub = this.coursesService.makeCourseEnrollAction(courseId, 'enroll')
            .pipe(
                catchError(err => {
                    return throwError(() => new Error(err.error.message))
                }),
            )
            .subscribe({
                next: (res) => {
                    console.log('Enrolled on course!', res);
                    this.courseEnrollTrigger$.next();
                    this.enrollmentSub?.unsubscribe()
                },
                error: (err) => {
                    console.warn(err);
                    this.enrollmentSub?.unsubscribe()
                }
            })
    }

    public leaveCourse(courseId: number): void {
        console.log('111 leave course', courseId);
    }
}
