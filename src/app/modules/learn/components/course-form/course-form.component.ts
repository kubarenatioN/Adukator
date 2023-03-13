import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
	EmptyCourseFormDataType,
	EMPTY_COURSE_FORM_DATA,
} from 'src/app/constants/common.constants';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import { convertCourseToCourseFormData } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { CourseFormDataMock } from 'src/app/mocks/course-form-data';
import { ConfigService } from 'src/app/services/config.service';
import {
	CourseFormData,
	CourseFormViewMode,
	CourseReview,
} from 'src/app/typings/course.types';


@Component({
	selector: 'app-course-form',
	templateUrl: './course-form.component.html',
	styleUrls: ['./course-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent implements OnInit {
	private _mode: CourseFormViewMode = CourseFormViewMode.Create;
	private courseFormData: CourseFormData | null = null;

    public categories$ = this.configService.loadCourseCategories();

	public courseForm: FormGroup;
	public viewModes = CourseFormViewMode;
	public isReadonly = false;

	public get modules(): FormArray {
		return this.courseForm.get('modules') as FormArray;
	}

	private get editorModules(): FormArray {
		return this.editorComments.get('modules') as FormArray;
	}

	private get editorComments() {
		return this.courseForm.get('editorComments') as FormGroup;
	}

	public get modulesControls(): FormGroup[] {
		return this.modules.controls as FormGroup[];
	}

	public get viewMode(): CourseFormViewMode {
		return this._mode;
	}

    public get category(): string {
        return this.courseFormData?.categoryLabel || ''
    }

	@Input() public set mode(value: CourseFormViewMode) {
		this._mode = value;
	}

	@Input() public set formData(
		data: CourseReview | EmptyCourseFormDataType
	) {
        // console.log('111 form data', data);
		if (data !== EMPTY_COURSE_FORM_DATA) {
            const courseFormData = convertCourseToCourseFormData(data);
			this.courseFormData = courseFormData;
			this.setCourseModel(courseFormData);
		} else {
			this.addStartModule();
		}
	}

	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter<CourseFormData>();
	@Output() public createReviewVersion = new EventEmitter<{
        isMaster: boolean;
        formData: CourseFormData;
    }>();
	@Output() public update = new EventEmitter<CourseFormData>();

	constructor(private fb: FormBuilder, private configService: ConfigService, private fbHelper: FormBuilderHelper) {
		this.courseForm = this.fb.group({
			title: [CourseFormDataMock.title, Validators.required],
			description: [CourseFormDataMock.descr, Validators.required],
			category: ['', Validators.required],
			modules: this.fb.array([]),
			editorComments: this.fb.group({
				...this.fbHelper.getEmptyEditorComments(),
				modules: this.fb.array([]),
			}),
		});
	}

	ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			console.log('111 course form changed value', res);
			// console.log('111 course form changed form', this.courseForm);
		});
	}

	public addStartModule(): void {
		const moduleControl = this.fbHelper.getEmptyModule()

		moduleControl.controls['topics'].setValidators([
			moduleTopicsCountValidator(),
		]);
		this.modules.push(moduleControl);

        const moduleCommentsForm = this.fbHelper.getEditorCommentsModules([moduleControl.value], { isEmpty: true });
        this.editorModules.push(moduleCommentsForm[0]);
	}

	public removeModule(index: number): void {
		this.modules.removeAt(index);
	}

	public onChangeCustomCategory(
		change: MatCheckboxChange,
		field: 'userCategory' | 'userSubcategory'
	) {
		const { checked } = change;
		if (!checked) {
			this.courseForm?.get(field)?.setValue('');
		}
	}

	public onSubmit(action: CourseFormViewMode | 'publish'): void {
		const { valid: isValid } = this.courseForm;
        const { value }: { value: CourseFormData } = this.courseForm;

		if (this.courseFormData !== null && action === 'create') {
			throw new Error('Cannot create not empty course.');
		}

		switch (action) {
			case 'create': {
                if (isValid && this.courseFormData === null) {
                    this.onCreateReviewVersion(value, true)
				} else {
                    console.warn('Invalid form data.');
                }
				break;
			}
			case 'review': {
				const { valid: isValid } = this.editorComments;
				if (isValid && this.courseFormData) {
					this.saveReview.emit(value);
				} else {
					console.error('Invalid review form');
				}
				break;
			}
			case 'edit': {
				if (isValid && this.courseFormData) {
					this.onCreateReviewVersion(value, false)
				}
				break;
			}
			case 'publish': {
				// TEMP: skip validation
                // TODO: uncomment later
                // if (isValid && this.courseFormData && this.viewMode === this.viewModes.Review) {
				// 	this.publish.emit(value)
				// }
				this.publish.emit(value)
				break;
			}

			default:
				break;
		}
	}

    private onCreateReviewVersion(formData: CourseFormData, isMaster: boolean): void {
        this.createReviewVersion.emit({
            isMaster,
            formData,
        });
    }

    public getTopicEditorCommentsForm(moduleIndex: number, topicIndex: number): FormGroup | null {
        if (this.editorModules === null) {
            return null;
        }
        const topic = ((this.editorModules.at(moduleIndex) as FormGroup).get('topics') as FormArray).at(topicIndex) as FormGroup
        if (topic === null) {
            return null;
        }
        return topic;
    }

    public getModuleEditorCommentsForm(moduleIndex: number): FormGroup | null {
        if (this.editorModules === null) {
            return null;
        }
        return this.editorModules.at(moduleIndex) as FormGroup;
    }

	private setCourseModel(course: CourseFormData): void {
		const { modules, editorComments } = course;

		const modulesArray = this.fbHelper.getModulesFormArray(modules);
		const editorModulesArray = this.fbHelper.getEditorComments(editorComments, modules);

		this.courseForm.patchValue({
			title: course.title,
			description: course.description,
			category: course.category,
			editorComments: editorComments ?? this.fbHelper.getEmptyEditorComments(),
		});

		modulesArray.controls.forEach((control) => {
			this.modules.push(control);
		});

		editorModulesArray.forEach((control) => {
			this.editorModules.push(control);
		});
	}
}
