import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, catchError, combineLatest, filter, map, shareReplay, switchMap, throwError } from 'rxjs';
import { isEmptyCourseFormData } from 'src/app/constants/common.constants';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import {
	CourseBuilderViewData,
	CourseReview,
	WrapperType,
	CourseFormViewMode,
	CourseBuilderViewType,
	CourseFormData,
	CourseFormMetadata,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';
import { ActivatedRoute, Router } from '@angular/router';
import { convertCourseReviewToCourseFormData } from 'src/app/helpers/courses.helper';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-review-course',
	templateUrl: './review-course.component.html',
	styleUrls: ['./review-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCourseComponent implements OnInit {
	public metadata!: CourseFormMetadata
	public formData$!: Observable<CourseReview | null>;
	public viewData$!: Observable<CourseBuilderViewData>;
	public masterId: string | null = null
	public wrapperControlType: WrapperType = 'review'
	
	public activeFormGroup!: FormGroup
	public courseForm!: ReturnType<typeof this.fbHelper.getNewCourseFormModel>;
	public get overallInfoSubform() {
		return this.courseForm.controls.overallInfo;
	}
	public get modulesFormArray() {
		return this.courseForm.controls.modules;
	}

	constructor(
		private fbHelper: FormBuilderHelper,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private courseBuilderService: CourseBuilderService,
		private cdRef: ChangeDetectorRef
	) { }

	ngOnInit(): void {
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
				const courseId = String(params.get('id'));
				this.courseBuilderService.courseId = courseId;
				return this.courseBuilderService.getFormData(courseId, CourseFormViewMode.Review);
			}),
			map(formData => {
				if (isEmptyCourseFormData(formData)) {
					return null;
				}
				this.metadata = this.courseBuilderService.metadata
				return formData
			}),
			shareReplay(1)
		);

		this.formData$
			.pipe(filter(Boolean))
			.subscribe(course => {
				const formData = convertCourseReviewToCourseFormData(course)
				this.courseForm = this.fbHelper.getNewCourseFormModel(course.uuid)
				this.setCourseModel(this.courseForm, formData)
				this.courseBuilderService.rebuildContentTree(this.courseForm)
				this.listenForm(this.courseForm)
			})

		combineLatest([navQuery$, this.formData$]).subscribe(([navQuery]) => {
			this.courseBuilderService.setViewData(navQuery, CourseFormViewMode.Review);
		});

		this.courseBuilderService.viewData$.subscribe(viewData => {
			this.activeFormGroup = this.courseBuilderService.getActiveFormGroup(this.courseForm, viewData.viewPath)
		})
	}

	public getTopicDuration(days?: number | null, weeks?: number | null) {
		const weeksNum = weeks ? Number(weeks) : 0
		const daysNum = days ? Number(days) : 0

		return `Дней: ${weeksNum * 7 + daysNum}`
		// return `${weeksNum > 0 ? 'Недель: ' + weeks : ''} ${daysNum > 0 ? 'Дней: ' + days : ''}`
	}

	public onSubmit(action: 'review' | 'publish') {
		console.log(action);
		switch (action) {
			case 'review': {
				const comments = {
					overallComments: this.overallInfoSubform.value.comments,
					modules: this.modulesFormArray.value,
				};
				this.onSaveReview(comments);
				break;
			}
			case 'publish': {
				const { value } = this.courseForm
				this.onPublish(value as unknown as CourseFormData);
				break;
			}

			default:
				break;
		}
	}

	private listenForm(form: typeof this.courseForm) {
		form.valueChanges.subscribe(model => {
			// console.log(model);
		})
	}

	private onSaveReview(comments: {
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

	private onPublish(formData: CourseFormData): void {
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

	private setCourseModel(courseForm: typeof this.courseForm, courseData: CourseFormData): void {
		this.fbHelper.fillCourseModel(courseForm, courseData);
	}
}
