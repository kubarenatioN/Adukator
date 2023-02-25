import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, throwError } from 'rxjs';
import {
	map,
	shareReplay,
	switchMap,
	take,
	withLatestFrom,
} from 'rxjs/operators';
import {
	EmptyCourseFormDataType,
	EMPTY_COURSE_FORM_DATA,
} from 'src/app/constants/common.constants';
import {
	convertCourseToCourseFormData,
	stringifyModules,
} from 'src/app/helpers/courses.helper';
import {
	NetworkHelper,
	NetworkRequestKey,
} from 'src/app/helpers/network.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { CoursesService } from 'src/app/services/courses.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { CourseFormData, CourseFormViewMode } from 'src/app/typings/course.types';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
	private courseData?: CourseFormData;

	public formData$!: Observable<CourseFormData | EmptyCourseFormDataType>;
	public viewMode$!: Observable<CourseFormViewMode | null>;
	public showLoading$ = new BehaviorSubject<boolean>(false);

    public viewModes = CourseFormViewMode

	constructor(
		private dataService: DataService,
		private userService: UserService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private coursesService: CoursesService,
		private adminCoursesService: AdminCoursesService
	) {}

	public ngOnInit(): void {
		const queryParams$: Observable<{
            action?: string
            courseId?: number
        }> = this.activatedRoute.queryParams.pipe(
			take(1),
			map((params) => {
				const courseId = Number(params['id']);
				const action = params['action'];
				return {
					courseId: isNaN(courseId) ? undefined : courseId,
					action,
				};
			})
		);

		this.formData$ = queryParams$.pipe(
            withLatestFrom(this.userService.user$),
			switchMap(([{ courseId, action }, user]) => {
                if (user !== null) {
                    const { role } = user;
                    if (role === 'admin' && courseId) {
                        return this.adminCoursesService.getReviewCourse(courseId)
                    }
                    if (courseId && action) {
                        return this.coursesService.getUserReviewCourse(courseId);
                    }
                }
                else {
                    throw new Error('Try to get course form data with no user.');
                }
				return of(null);
			}),
			map((course) => {
				return course !== null
					? convertCourseToCourseFormData(course)
					: EMPTY_COURSE_FORM_DATA;
			}),
            shareReplay(1),
		);

		const userInfo$ = combineLatest([
            queryParams$,
            this.userService.user$,
            this.coursesService.userCourses$
        ]).pipe(	
			map(([{ courseId, action }, user, userCourses]) => {
                const isUserOwnCourse = userCourses?.review?.findIndex(
                    (course) => course.id === courseId
                ) !== -1;
                
				const isTeacherChangeOwnCourse =
                    isUserOwnCourse &&
                    (action === CourseFormViewMode.Update || action === CourseFormViewMode.Edit) &&
					user?.role === 'teacher'

				const isAdminReview =
					action === CourseFormViewMode.Review && user?.role === 'admin';

				return {
                    isValid: isTeacherChangeOwnCourse || isAdminReview,
                    role: user?.role
                };
			})
		);

		this.viewMode$ = combineLatest([
			this.formData$,
			userInfo$,
			queryParams$.pipe(map(({ action }) => action)),
		]).pipe(
            map(([formData, userInfo, action]) => {
                const { isValid: isValidUser, role: userRole } = userInfo
                if (formData === 'EmptyCourse' && !action && userRole === 'teacher') {
                    return CourseFormViewMode.Create
                }
                else if (isValidUser && action === 'update') {
                    return CourseFormViewMode.Update
                }
                else if (isValidUser && action === 'edit') {
                    return CourseFormViewMode.Edit
                }
                else if (isValidUser && action === 'review') {
                    return CourseFormViewMode.Review
                }
                return CourseFormViewMode.Default
            })
        );
	}

	public onPulish(courseData: CourseFormData): void {
		console.log('111 on change form Data', courseData);
		this.userService.user$
			.pipe(
				switchMap((user) => {
					if (user && user.role === 'teacher') {
						const course = {
							...courseData,
							modules: stringifyModules(courseData.modules),
							authorId: user.id,
						};
						const payload = NetworkHelper.createRequestPayload(
							NetworkRequestKey.CreateCourse,
							{
								body: { course },
							}
						);
						this.showLoading();
						return this.dataService.send(payload);
					} else {
						return throwError(
							() =>
								new Error(
									'User has no permission to create a course.'
								)
						);
					}
				})
			)
			.subscribe({
				next: (res) => {
					console.log('111 create course response', res);
				},
				error: (err) => console.error(err),
			});
	}

	public onSaveDraft(courseDraft: CourseFormData): void {
		console.log('111 on save draft', courseDraft);
	}

	public publishCourse() {
		// const processedCourseData = this.processCourseFormData(data);
	}

	public onSubmit(action: 'draft' | 'publish'): void {
		// const { valid: isValid, value, errors } = this.courseForm;
		// if (isValid) {
		// 	if (action === 'publish') {
		// 		this.publishCourse(value);
		// 	}
		// 	console.log(action, value);
		// } else {
		// 	console.log(action, errors);
		// }
	}

	private showLoading() {
		this.showLoading$.next(true);
		setTimeout(() => {
			this.router.navigate(['/app/learn']);
		}, 2000);
	}
}
