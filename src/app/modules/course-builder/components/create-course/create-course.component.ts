import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, ReplaySubject } from 'rxjs';
import {
    map,
	shareReplay,
	switchMap,
	tap,
} from 'rxjs/operators';
import {
    EmptyCourseFormData,
	getEmptyCourseFormData,
    isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import {
    convertCourseFormDataToCourse,
    convertCourseFormDataToCourseReview,
	generateUUID,
} from 'src/app/helpers/courses.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { CoursesService } from 'src/app/services/courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';
import { CourseBuilderViewData, CourseBuilderViewType, CourseFormData, CourseFormMetadata, CourseFormViewMode, CourseModule, CourseReview, CourseReviewStatus } from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

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
		private teacherCoursesService: TeacherCoursesService,
		private adminCoursesService: AdminCoursesService,
		private courseBuilderService: CourseBuilderService,
        private uploadService: UploadService,
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
                        this.courseMetadata = this.getMasterCourseMetadata(user.uuid)
                        return of(getEmptyCourseFormData(generateUUID()));
                    } else {
                        const courseId = String(params.get('id'));
                        if (mode === CourseFormViewMode.Review) {
                            return this.adminCoursesService.getCourseReviewVersion(courseId);
                        }
                        return this.teacherCoursesService.getCourseReviewVersion(courseId);
                    }
                }),
                tap(course => {
                    if (course !== null && !isEmptyCourseFormData(course)) {
                        this.courseMetadata = this.cloneParentCourseMetadata(course)
                    }
                    this.courseBuilderService.courseId = course.uuid
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

        const courseId = this.courseBuilderService.courseId;
        this.uploadService.moveFilesToRemote(courseId).subscribe(res => {
            console.log('Moved files to remote', res)
        }, err => {
            console.warn('Error uploading files to remote.', err);
        })
	}

    public onPublish(formData: CourseFormData): void {
        formData = this.restoreCourseMetadata(formData, this.courseMetadata)
        const courseData = convertCourseFormDataToCourse(formData)
        const masterId = formData.metadata.masterCourseId || formData.metadata.uuid
        this.adminCoursesService.publish(courseData, masterId)
            .subscribe(res => {
                console.log('111 course published', res);
            })
	}

	public onSaveReview(comments: { overallComments: unknown; modules: unknown }): void {
        const id = this.courseMetadata._id;
        if (!id) {
            console.error('No _id provided to save review');
            return;
        }
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

    private getMasterCourseMetadata(authorId: string): CourseFormMetadata {
        return {
            uuid: generateUUID(),
            authorId,
            masterCourseId: null,
            status: CourseReviewStatus.Default
        }
    }

    private cloneParentCourseMetadata(parentCourse: CourseReview): CourseFormMetadata {
        return {
            _id: parentCourse._id,
            uuid: generateUUID(),
            authorId: parentCourse.authorId,
            masterCourseId: parentCourse.masterId === null ? parentCourse.uuid : parentCourse.masterId, // all the versions point to the most first course version, the first one points to null
            status: parentCourse.status
        }
    }
}
