import { ThisReceiver } from '@angular/compiler';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';
import {
    catchError,
	filter,
	map,
	shareReplay,
	switchMap,
	take,
	tap,
	withLatestFrom,
} from 'rxjs/operators';
import {
    EmptyCourseFormData,
	getEmptyCourseFormData,
    isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import {
    convertCourseFormDataToCourse,
    convertCourseFormDataToCourseReview,
	convertCourseToCourseFormData,
	generateUUID,
} from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
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
export class CreateCourseComponent extends CenteredContainerDirective implements OnInit, OnDestroy {
	private courseMetadata!: CourseFormMetadata;
	private modulesStore$ = new ReplaySubject<CourseModule[]>(1);

    public formMode: CourseFormViewMode = CourseFormViewMode.Create;

	public modules$: Observable<CourseModule[]>;
    public formData$!: Observable<CourseReview | EmptyCourseFormData | null>;
    public viewData$!: Observable<CourseBuilderViewData | null>;

	public showLoading$ = new BehaviorSubject<boolean>(false);

	constructor(
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private coursesService: CoursesService,
		private adminCoursesService: AdminCoursesService,
	) {
        super();
        this.modules$ = this.modulesStore$.asObservable();
    }

	public ngOnInit(): void {

        const navQuery$ = this.activatedRoute.queryParams
            .pipe(
                map((query) => {                    
                    const moduleNumber = Number(query['module']);
                    const module = Number.isNaN(moduleNumber) ? undefined : moduleNumber;
                    
                    const topicNumber = Number(query['topic']);
                    const topic = Number.isNaN(topicNumber) ? undefined : topicNumber;

                    const viewType = this.resolveViewType(module, topic)
                    return {
                        type: viewType,
                        module: module ? module - 1 : module,
                        topic: topic ? topic - 1 : topic,
                    }
                }),
                shareReplay(),
            );

		this.formData$ = combineLatest([
            this.activatedRoute.paramMap,
            this.userService.user$,
        ])
            .pipe(
                switchMap(([params, user]) => {
                    const { mode } = this.activatedRoute.snapshot.data as { mode: CourseFormViewMode };
                    if (mode === CourseFormViewMode.Create) {
                        this.courseMetadata = this.getMasterCourseMetadata(user.id)
                        return of(getEmptyCourseFormData(generateUUID()));
                    } else {
                        const courseId = Number(params.get('id'));
                        if (mode === CourseFormViewMode.Review) {
                            return this.adminCoursesService.getReviewCourse(courseId);
                        }
                        return this.coursesService.getTeacherReviewCourse(courseId);
                    }
                }),
                tap(course => {
                    if (course !== null && !isEmptyCourseFormData(course)) {
                        this.courseMetadata = this.getCourseMetadata(course)
                    }
                }),
                shareReplay(1),    
            )

        this.viewData$ = this.formData$.pipe(
            switchMap(() => navQuery$),
            map((navQuery) => {
                const { mode } = this.activatedRoute.snapshot.data as { mode: CourseFormViewMode };
                return {
                    viewPath: { ...navQuery },
                    mode,
                    metadata: this.courseMetadata,
                }
            }),
            shareReplay(1),
        )
	}

	public onCreateReviewVersion({ formData, isMaster }: { formData: CourseFormData, isMaster: boolean }): void {
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

    public onPublish(formData: CourseFormData): void {
        formData = this.restoreCourseMetadata(formData, this.courseMetadata)
        const courseData = convertCourseFormDataToCourse(formData)
        const masterId = formData.metadata.masterCourseId || formData.metadata.id
        this.adminCoursesService.publish(courseData, masterId)
            .subscribe(res => {
                console.log('111 course published', res);
            })
	}

	public onSaveReview(comments: { overallComments: string; modules: string }): void {
        const id = this.courseMetadata.id;
        this.adminCoursesService.saveCourseReview(id, comments)
            .subscribe(() => {
                console.log('course review updated');
            });
	}

    public onFormChanged(form: FormGroup) {
        this.modulesStore$.next(form.controls['modules'].value);
    }

    private resolveViewType(module?: number, topic?: number): CourseBuilderViewType {
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

    private getMasterCourseMetadata(authorId: number): CourseFormMetadata {
        return {
            id: -1,
            secondaryId: generateUUID(),
            authorId,
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
