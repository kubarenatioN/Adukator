import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, combineLatest, filter, map, shareReplay, switchMap } from 'rxjs';
import { isEmptyCourseFormData } from 'src/app/constants/common.constants';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import {
	CourseBuilderViewData,
	CourseReview,
	WrapperType,
	CourseFormViewMode,
	CourseBuilderViewType,
	CourseFormData,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';
import { ActivatedRoute } from '@angular/router';
import { convertCourseReviewToCourseFormData } from 'src/app/helpers/courses.helper';

@Component({
	selector: 'app-review-course',
	templateUrl: './review-course.component.html',
	styleUrls: ['./review-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCourseComponent implements OnInit {
	public formData$!: Observable<CourseReview | null>;
	public viewData$!: Observable<CourseBuilderViewData>;
	
	public controlsType: WrapperType = 'review'
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
		private courseBuilderService: CourseBuilderService,
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
			})

		combineLatest([navQuery$, this.formData$]).subscribe(([navQuery]) => {
			this.courseBuilderService.setViewData(navQuery, CourseFormViewMode.Review);
		});
	}

	public onSubmit(action: 'review' | 'publish') {
		console.log(action);
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

	private setCourseModel(courseForm: typeof this.courseForm, courseData: CourseFormData): void {
		this.fbHelper.fillCourseModel(courseForm, courseData);
	}
}
