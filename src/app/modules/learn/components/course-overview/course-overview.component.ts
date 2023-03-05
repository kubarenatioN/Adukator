import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, shareReplay, Subscription, switchMap, throwError, withLatestFrom } from 'rxjs';
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
    public course$: Observable<Course | null>;

    public modules$: Observable<CourseModule[]>

    public canEnroll$: Observable<boolean>;
    public isEnrolled$: Observable<boolean | null>;
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

        this.isEnrolled$ = this.course$.pipe(
            switchMap(course => {
                if (course) {
                    return this.coursesService.makeCourseEnrollAction(course.id, 'lookup')
                }
                return of(null);
            }),
            withLatestFrom(this.userService.user$),
            map(([result, user]) => {
                if (result === null) {
                    return false;
                }
                const { data, action } = result
                if (
                    action === 'lookup' &&
                    data.length > 0 && 
                    data.findIndex(record => record.userId === user?.id) !== -1
                ) {
                    return true;
                }
                return false;
            }),
            shareReplay(1),
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
