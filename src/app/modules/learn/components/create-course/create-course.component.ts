import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, throwError } from 'rxjs';
import {
    catchError,
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
    convertCourseFormDataToCourse,
    convertCourseFormDataToCourseReview,
	convertCourseToCourseFormData,
	stringify,
} from 'src/app/helpers/courses.helper';
import {
	NetworkHelper,
	NetworkRequestKey,
} from 'src/app/helpers/network.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { CoursesService } from 'src/app/services/courses.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { CourseFormData, CourseFormMetadata, CourseFormViewMode, CourseReview, CourseReviewStatus } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
	private courseMetadata!: CourseFormMetadata;

	public formData$!: Observable<CourseReview | EmptyCourseFormDataType>;
	public viewMode$!: Observable<CourseFormViewMode | null>;
	public showLoading$ = new BehaviorSubject<boolean>(false);

    public viewModes = CourseFormViewMode

	constructor(
		private dataService: DataService,
		private userService: UserService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private coursesService: CoursesService,
		private adminCoursesService: AdminCoursesService,
        private location: Location,
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
                return EMPTY_COURSE_FORM_DATA;
			}),
            shareReplay(1),
		);

		const userInfo$ = combineLatest([
            queryParams$,
            this.userService.user$,
            this.coursesService.teacherUserCourses$
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

	public onPulish(formData: CourseFormData): void {
        formData = this.restoreCourseMetadata(formData, this.courseMetadata)
        const courseData = convertCourseFormDataToCourse(formData)
        const masterId = formData.metadata.masterCourseId || formData.metadata.id
        this.adminCoursesService.publish(courseData, masterId)
            .subscribe(res => {
                console.log('111 course published', res);
            })
	}

	public onSaveReview(formData: CourseFormData): void {
        const id = this.courseMetadata.id;
        const comments = stringify(formData.editorComments)
        this.adminCoursesService.saveCourseReview(id, comments)
            .subscribe(() => {
                console.log('course review updated');
            });
	}

	public onCreateReviewVersion({ formData, isMaster }: { formData: CourseFormData, isMaster: boolean }): void {
        if (isMaster) {
            formData.editorComments = null;
        }
        this.restoreCourseMetadata(formData, this.courseMetadata);

        const courseData = convertCourseFormDataToCourseReview(formData);
        console.log(courseData);
        this.coursesService.createCourseReviewVersion(courseData, { isMaster })
            .subscribe((res) => {
                console.log('course review new version created!', res);
            });
	}

    public goBack() {
        this.location.back();
    }

	private showLoading() {
		this.showLoading$.next(true);
		setTimeout(() => {
			this.router.navigate(['/app/learn']);
		}, 2000);
	}

    private restoreCourseMetadata(formData: CourseFormData, metadata: CourseFormMetadata): CourseFormData {
        formData.metadata = metadata
        return formData
    }

    private getMasterCourseMetadata(author: User): CourseFormMetadata {
        return {
            id: -1,
            authorId: author.id,
            masterCourseId: null,
            status: CourseReviewStatus.Default
        }
    }

    private getCourseMetadata(course: CourseReview): CourseFormMetadata {
        return {
            id: course.id,
            authorId: course.authorId,
            masterCourseId: course.masterId === null ? course.id : course.masterId, // if get master course, correct new course version masterId value
            status: course.status
        }
    }
}
