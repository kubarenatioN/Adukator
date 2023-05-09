import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
	BehaviorSubject,
	Observable,
	combineLatest,
	debounceTime,
	generate,
	map,
	takeUntil,
	tap,
} from 'rxjs';
import {
	EmptyCourseFormData,
	isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import {
	convertCourseReviewToCourseFormData,
	generateUUID,
} from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { getTopicMinDate, getTopicMaxDate } from 'src/app/helpers/forms.helper';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import {
	CourseBuilderViewData,
	CourseBuilderViewPath,
	CourseBuilderViewType,
	CourseFormData,
	CourseFormViewMode,
	CourseReview,
	ModuleTopic,
	WrapperType,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';
import { ChipItem } from '../../controls/chips-control/chips-control.component';

@Component({
	selector: 'app-course-form',
	templateUrl: './course-form.component.html',
	styleUrls: ['./course-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent extends BaseComponent implements OnInit {
	public categories$ = this.configService.loadCourseCategories();
	public competencies$!: Observable<ChipItem[]>;

	public courseForm!: ReturnType<typeof this.fbHelper.getNewCourseFormModel>;
	public activeFormGroup!: FormGroup;
	public get overallInfoSubform() {
		return this.courseForm.controls.overallInfo;
	}
	public get modulesFormArray() {
		return this.courseForm.controls.modules;
	}

	public formMode!: CourseFormViewMode;
	public viewType$ = new BehaviorSubject<CourseBuilderViewType | null>(null);
	public canEditForm = true;
	public viewData$!: Observable<CourseBuilderViewData>;

	public viewModes = CourseFormViewMode;
	public controlsType: WrapperType = 'edit';

	@Input() public set formData(
		data: CourseReview | EmptyCourseFormData | null
	) {
		if (data === null) {
			return;
		}

		if (!isEmptyCourseFormData(data)) {
			const formData = convertCourseReviewToCourseFormData(data);
			this.setCourseModel(formData);
		}

		this.formChanged.emit(this.courseForm);
	}

	@Output() public createReviewVersion = new EventEmitter<{
		isMaster: boolean;
		formData: CourseFormData;
	}>();
	@Output() public update = new EventEmitter<CourseFormData>();
	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter();
	@Output() public formChanged = new EventEmitter<typeof this.courseForm>();

	constructor(
		private configService: ConfigService,
		private fbHelper: FormBuilderHelper,
		private courseBuilderService: CourseBuilderService
	) {
		super();
	}

	public ngOnInit(): void {
		const courseId = this.courseBuilderService.courseId;
		this.courseForm = this.fbHelper.getNewCourseFormModel(courseId);

		this.courseForm.valueChanges.subscribe((res) => {
			// console.log('111 main course form', res);
			this.formChanged.emit(this.courseForm);
		});

		this.viewData$ = this.courseBuilderService.viewData$.pipe(
			takeUntil(this.componentLifecycle$),
			tap((viewData) => {
				const { metadata, mode, viewPath } = viewData;
				this.formMode = mode;
				if (mode === CourseFormViewMode.Review) {
					this.canEditForm = false;
					this.controlsType = 'review';
				}
				this.viewType$.next(viewPath.type);
				this.overallInfoSubform.controls.id.setValue(metadata.uuid);
				this.activeFormGroup = this.getFormGroup(viewPath);
			})
		);

		this.competencies$ = combineLatest([
			this.overallInfoSubform.controls.category.valueChanges.pipe(
				debounceTime(200)
			),
			this.configService.loadCourseCompetencies(),
		]).pipe(
			map(([category, competencies]) => {
				return competencies.filter((comp) =>
					!comp.category ? true : comp.category === category
				);
			})
		);
	}

	public addModule() {
		const emptyModuleForm = this.fbHelper.getModuleForm();
		this.courseForm.controls.modules.push(emptyModuleForm);
	}

	public addTopic(moduleForm: (typeof this.modulesFormArray.controls)[0]) {
		if (!moduleForm.value.id) {
			throw new Error('No topic parent module id provided.');
		}
		const emptyTopicForm = this.fbHelper.getTopicForm(moduleForm.value.id);
		const topicsArray = moduleForm.controls.topics;
		topicsArray.push(emptyTopicForm);
		moduleForm.controls.topics = topicsArray;
		// console.log(topicsArray, this.modulesFormArray.value);
	}

	public removeModule(id: string): void {
		// IMPLEMENT
		// this.modulesFormArray.removeAt(index...);
	}

	public onSubmit(action: CourseFormViewMode | 'publish'): void {
		const { valid: isValid } = this.courseForm;
		const { value } = this.courseForm;

		switch (action) {
			case 'create': {
				if (isValid) {
					this.onCreateReviewVersion(
						value as unknown as CourseFormData,
						true
					);
				} else {
					console.warn('Invalid form data.');
				}
				break;
			}
			case 'edit': {
				if (isValid) {
					this.onCreateReviewVersion(
						value as unknown as CourseFormData,
						false
					);
				}
				break;
			}
			case 'review': {
				this.onSaveReview();
				break;
			}
			case 'publish': {
				this.publish.emit(value as unknown as CourseFormData);
				break;
			}

			default:
				break;
		}
	}

	public getDateInputMin(form: FormGroup): Date | null {
		return getTopicMinDate(this.courseForm, form);
	}

	public getDateInputMax(form: FormGroup): Date | null {
		return getTopicMaxDate(this.courseForm, form);
	}

	private getFormGroup({ type, module, topic }: CourseBuilderViewPath): any {
		try {
			if (module != null && type === 'module') {
				const moduleForm = this.findControlById(
					[...this.courseForm.controls.modules.controls],
					module
				);
				if (type === 'module') {
					return moduleForm;
				}
			} else if (topic != null && type === 'topic') {
				const topics: FormGroup[] = [];
				this.courseForm.controls.modules.controls.forEach((module) => {
					topics.push(...module.controls.topics.controls);
				});
				return this.findControlById(topics, topic);
			} else {
				return this.courseForm.controls.overallInfo;
			}
		} catch (error) {
			this.viewType$.next('main');
			return this.courseForm.controls.overallInfo;
		}
	}

	private onCreateReviewVersion(
		formData: CourseFormData,
		isMaster: boolean
	): void {
		this.createReviewVersion.emit({
			isMaster,
			formData,
		});
	}

	private onSaveReview() {
		const comments = {
			overallComments: this.overallInfoSubform.value.comments,
			modules: this.modulesFormArray.value,
		};
		this.saveReview.emit(comments);
	}

	private setCourseModel(courseData: CourseFormData): void {
		this.fbHelper.fillCourseModel(this.courseForm, courseData);
	}

	private findControlById(array: FormGroup[], id: string): FormGroup {
		return array.find((control) => control.value.id === id) as FormGroup;
	}
}
