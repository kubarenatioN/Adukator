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
	delay,
	map,
	of,
	shareReplay,
	startWith,
	takeUntil,
	tap,
} from 'rxjs';
import {
	EmptyCourseFormData,
	isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import {
	convertCourseReviewToCourseFormData,
} from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { getTopicMinDate, getTopicMaxDate } from 'src/app/helpers/forms.helper';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import {
	CourseBuilderViewData,
	CourseBuilderViewType,
	CourseFormData,
	CourseFormModule,
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
			if (!this.competencies$) {
				this.listenCompetencies()
			}
			this.formChanged.emit(this.courseForm);
		}
	}

	@Output() public createReviewVersion = new EventEmitter<{
		isMaster: boolean;
		formData: CourseFormData;
	}>();
	@Output() public update = new EventEmitter<CourseFormData>();
	@Output() public formChanged = new EventEmitter<typeof this.courseForm>();

	constructor(
		private configService: ConfigService,
		private fbHelper: FormBuilderHelper,
		private courseBuilderService: CourseBuilderService
	) {
		super();
		const courseId = this.courseBuilderService.courseId;
		this.courseForm = this.fbHelper.getNewCourseFormModel(courseId);
	}

	public ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			// console.log('111', res);
			this.formChanged.emit(this.courseForm);
		});

		this.viewData$ = this.courseBuilderService.viewData$.pipe(
			takeUntil(this.componentLifecycle$),
			tap((viewData) => {
				const { metadata, mode, viewPath } = viewData;
				this.formMode = mode;

				this.viewType$.next(viewPath.type);
				this.overallInfoSubform.controls.id.setValue(metadata.uuid);
				this.activeFormGroup = this.courseBuilderService.getActiveFormGroup(this.courseForm, viewPath);
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
	}

	public removeModule(moduleForm: FormGroup): void {
		const module = moduleForm.value as CourseFormModule
		this.modulesFormArray.removeAt(this.modulesFormArray.value.findIndex(m => m.id === module.id))
	}

	public removeTopic(topicForm: FormGroup) {
		const topic = topicForm.value as ModuleTopic
		const topicModule = this.modulesFormArray.controls.find(m => m.value.id === topic.moduleId)
		if (topicModule) {
			const topicIndex = topicModule.controls.topics.value.findIndex(t => t.id === topic.id)
			topicModule.controls.topics.removeAt(topicIndex)
		}
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

	private listenCompetencies() {
		this.competencies$ = combineLatest([
			this.overallInfoSubform.controls.category.valueChanges.pipe(startWith(this.overallInfoSubform.value.category)),
			this.configService.competencies$,
		]).pipe(
			map(([category, competencies]) => {				
				return competencies.filter((comp) =>
					!comp.category ? true : comp.category === category
				);
			}),
			shareReplay(1),
		);
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

	private setCourseModel(courseData: CourseFormData): void {
		this.fbHelper.fillCourseModel(this.courseForm, courseData);
	}
}
