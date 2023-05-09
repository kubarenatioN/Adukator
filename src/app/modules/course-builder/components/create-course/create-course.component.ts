import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	combineLatest,
	Observable,
	BehaviorSubject,
	ReplaySubject,
	of,
	throwError,
} from 'rxjs';
import {
	catchError,
	distinctUntilChanged,
	map,
	shareReplay,
	switchMap,
	withLatestFrom,
} from 'rxjs/operators';
import { EmptyCourseFormData } from 'src/app/constants/common.constants';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import {
	CourseBuilderViewData,
	CourseBuilderViewType,
	CourseFormData,
	CourseFormMetadata,
	CourseFormModule,
	CourseFormViewMode,
	CourseModule,
	CourseReview,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';
import { generateUUID } from 'src/app/helpers/courses.helper';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent
	extends CenteredContainerDirective
	implements OnInit, OnDestroy
{
	private modulesStore$ = new ReplaySubject<CourseFormModule[]>(1);

	public formMode: CourseFormViewMode = CourseFormViewMode.Create;

	public modules$: Observable<CourseFormModule[]>;
	public formData$!: Observable<CourseReview | EmptyCourseFormData | null>;
	public viewData$!: Observable<CourseBuilderViewData>;

	public showLoading$ = new BehaviorSubject<boolean>(false);

	constructor(
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private courseBuilderService: CourseBuilderService,
		private router: Router
	) {
		super();
		this.modules$ = this.modulesStore$.asObservable();
	}

	public ngOnInit(): void {
		const { mode } = this.activatedRoute.snapshot.data as {
			mode: CourseFormViewMode;
		};

		this.viewData$ = this.courseBuilderService.viewData$;

		const navQuery$ = this.activatedRoute.queryParams.pipe(
			map((query) => {
				const module = query['module'];
				const topic = query['topic'];

				const viewType = this.resolveViewType(module, topic);
				return {
					type: viewType,
					module,
					topic,
				};
			}),
			shareReplay(1)
		);

		this.formData$ = this.activatedRoute.paramMap.pipe(
			switchMap((params) => {
				let courseId;
				if (mode === CourseFormViewMode.Create) {
					courseId = generateUUID();
				} else {
					courseId = String(params.get('id'));
				}
				this.courseBuilderService.courseId = courseId;
				return this.courseBuilderService.getFormData(courseId, mode);
			}),
			shareReplay(1)
		);

		combineLatest([navQuery$, this.formData$]).subscribe(([navQuery]) => {
			this.courseBuilderService.setViewData(navQuery, mode);
		});
	}

	public onCreateReviewVersion(payload: {
		formData: CourseFormData;
		isMaster: boolean;
	}): void {
		const timeoutId = this.queueRedirect(['/app/teacher']);

		this.courseBuilderService
			.createCourseReviewVersion(payload)
			.pipe(
				catchError((err) => {
					clearTimeout(timeoutId);
					return throwError(() => err);
				})
			)
			.subscribe({
				next: (res) => {
					if (res) {
						console.log('Course review new version created!', res);
					}
				},
				error: (err) => {
					console.error(err.message);
				},
			});
	}

	public onPublish(formData: CourseFormData): void {
		const timeoutId = this.queueRedirect(['/app/admin']);

		this.courseBuilderService
			.publishCourse(formData)
			.pipe(
				catchError((err) => {
					clearTimeout(timeoutId);
					return throwError(() => err);
				})
			)
			.subscribe({
				next: (res) => {
					console.log('Published course!', res);
				},
				error: (err) => {
					console.error(err.message);
				},
			});
	}

	// TODO: return stream back, to refresh state after request
	public onSaveReview(comments: {
		overallComments: unknown;
		modules: unknown;
	}): void {
		const timeoutId = this.queueRedirect(['/app/admin']);

		this.courseBuilderService
			.saveCourseReview(comments)
			.pipe(
				catchError((err) => {
					clearTimeout(timeoutId);
					return throwError(() => err);
				})
			)
			.subscribe({
				next: (res) => {
					console.log('Course review created!', res);
				},
				error: (err) => {
					console.error(err.message);
				},
			});
	}

	public onFormChanged(form: FormGroup) {
		this.modulesStore$.next(form.controls['modules'].value);
	}

	private resolveViewType(
		module?: string,
		topic?: string
	): CourseBuilderViewType {
		if (module) {
			return 'module';
		}
		if (topic) {
			return 'topic';
		}
		return 'main';
	}

	private queueRedirect(url: string[]) {
		return setTimeout(() => {
			this.router.navigate(url);
		}, 2000);
	}
}
