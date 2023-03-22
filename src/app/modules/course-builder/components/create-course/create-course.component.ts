import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';
import {
    catchError,
	filter,
	map,
	shareReplay,
	switchMap,
	take,
	withLatestFrom,
} from 'rxjs/operators';
import {
    EmptyCourseFormData,
	getEmptyCourseFormData,
    isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import {
    convertCourseFormDataToCourseReview,
	generateUUID,
} from 'src/app/helpers/courses.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { CourseBuilderViewData, CourseBuilderViewType, CourseFormData, CourseFormMetadata, CourseFormViewMode, CourseModule, CourseReview, CourseReviewStatus } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent extends CenteredContainerDirective implements OnInit {
	private courseMetadata!: CourseFormMetadata;
	private modulesStore$ = new ReplaySubject<CourseModule[]>(1);
	private viewDataStore$ = new ReplaySubject<CourseBuilderViewData>(1);

	public modules$: Observable<CourseModule[]>;
	public formData$!: Observable<CourseReview | EmptyCourseFormData>;
	public formMode$!: Observable<CourseFormViewMode | null>;
	public viewData$!: Observable<CourseBuilderViewData>;

	public courseData$!: Observable<{
        formData: CourseReview | EmptyCourseFormData;
        formMode: CourseFormViewMode;
        viewData: CourseBuilderViewData;
    }>;
	public showLoading$ = new BehaviorSubject<boolean>(false);

	constructor(
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private coursesService: CoursesService,
		private adminCoursesService: AdminCoursesService,
		private cd: ChangeDetectorRef,
	) {
        super();
        this.modules$ = this.modulesStore$.asObservable();
        this.viewData$ = this.viewDataStore$.asObservable();
    }

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
			}),
            shareReplay(1),
		);

        const navQuery$ = combineLatest([
            this.activatedRoute.queryParams,
        ]).pipe(
			map(([params]) => {
				let module = params['module'];
                module = Number.isNaN(module) ? undefined : Number(module)
				let topic = params['topic'];
                topic = Number.isNaN(topic) ? undefined : Number(topic)

                const type = this.resolveViewType(module, topic)
                this.viewDataStore$.next({
                    type,
                    module: module - 1,
                    topic: topic - 1,
                });
            })
		);

        navQuery$.subscribe();

		this.formData$ = queryParams$.pipe(
            withLatestFrom(this.userService.user$),
			switchMap(([{ courseId, action }, user]) => {
                if (user !== null) {
                    const { role } = user;
                    if (role === 'admin' && courseId) {
                        return this.adminCoursesService.getReviewCourse(courseId)
                    }
                    if (role === 'teacher') {
                        if (!courseId && (!action || action === CourseFormViewMode.Create)) {
                            this.courseMetadata = this.getMasterCourseMetadata(user);              
                            return of(null);
                        }
                        if (courseId && action) {
                            return this.coursesService.getTeacherReviewCourse(courseId);
                        }
                    }
                }
                throw new Error('Try to get course form data with no user.');
			}),
            catchError(err => {
                console.error(err);
                return of(null);
            }),
			map((course) => {
                if (course !== null) {
                    this.courseMetadata = this.getCourseMetadata(course);
                    return course;
                }
                return getEmptyCourseFormData(this.courseMetadata.secondaryId);
			}),
            shareReplay(1),
		);

		const userInfo$ = combineLatest([
            queryParams$,
            this.userService.user$,
            this.coursesService.teacherUserCourses$
        ]).pipe(	
			map(([{ courseId, action }, user, userCourses]) => {
                const isUserOwnCourse: boolean = userCourses?.review?.findIndex(
                    (course) => course.id === courseId
                ) !== -1;
                
				const isTeacherChangeOwnCourse: boolean =
                    isUserOwnCourse &&
                    (action === CourseFormViewMode.Update || action === CourseFormViewMode.Edit) &&
					user?.role === 'teacher'

				return {
                    isValid: isTeacherChangeOwnCourse,
                    role: user?.role
                };
			})
		);

		this.formMode$ = combineLatest([
			this.formData$,
			userInfo$,
			queryParams$.pipe(map(({ action }) => action)),
		]).pipe(
            map(([formData, userInfo, action]) => {
                const { isValid: isValidUser, role: userRole } = userInfo
                if (isEmptyCourseFormData(formData) && !action && userRole === 'teacher') {
                    return CourseFormViewMode.Create
                }
                else if (isValidUser && action === 'update') {
                    return CourseFormViewMode.Update
                }
                else if (isValidUser && action === 'edit') {
                    return CourseFormViewMode.Edit
                }
                return CourseFormViewMode.Default
            })
        );
 
        this.courseData$ = combineLatest([
            this.formData$,
            this.formMode$.pipe(filter(Boolean)),
            this.viewData$,
        ]).pipe(
            map(([formData, formMode, viewData]) => {
                return {
                    formData,
                    formMode,
                    viewData,
                }
            })
        )
	}

	public onCreateReviewVersion({ formData, isMaster }: { formData: CourseFormData, isMaster: boolean }): void {
        if (isMaster) {
            formData.editorComments = null;
        }
        this.restoreCourseMetadata(formData, this.courseMetadata);
        console.log('111 course form', formData);

        const courseData = convertCourseFormDataToCourseReview(formData);
        console.log('111 converted course form', courseData);
        // TODO: Uncomment method below
        this.coursesService.createCourseReviewVersion(courseData, { isMaster })
            .subscribe((res) => {
                console.log('course review new version created!', res);
            });
	}

    public onModuleAdded(modules: CourseModule[]) {
        this.modulesStore$.next(modules);
        this.cd.detectChanges();
    }

    private resolveViewType(module: number, topic: number): CourseBuilderViewType {
        if (module) {
            if (topic) {
                return 'topic'
            }
            return 'module'
        }
        return 'main';
    }

    private restoreCourseMetadata(formData: CourseFormData, metadata: CourseFormMetadata): CourseFormData {
        formData.metadata = metadata
        return formData
    }

    private getMasterCourseMetadata(author: User): CourseFormMetadata {
        return {
            id: -1,
            secondaryId: generateUUID(),
            authorId: author.id,
            masterCourseId: null,
            status: CourseReviewStatus.Default
        }
    }

    private getCourseMetadata(course: CourseReview): CourseFormMetadata {
        return {
            id: course.id,
            secondaryId: course.secondaryId,
            authorId: course.authorId,
            masterCourseId: course.masterId === null ? course.id : course.masterId, // if get master course, correct new course version masterId value
            status: course.status
        }
    }
}
