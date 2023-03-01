import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
	isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import { convertCourseToCourseFormData, getEmptyEditorComments } from 'src/app/helpers/courses.helper';
import {
	CourseEditorComments,
	CourseFormData,
	CourseFormMetadata,
	CourseFormViewMode,
	CourseModule,
	CourseReview,
	CourseTopic,
} from 'src/app/typings/course.types';

export const testFormData = {
	id: 123,
	title: 'йцу',
	description: 'фывфы',
	startTime: '2023-02-07T21:00:00.000Z',
	endTime: '2023-02-22T21:00:00.000Z',
	category: 'ячячс',
	subcategory: 'ываыва',
	userCategory: 'zxc',
	userSubcategory: 'xc',
	advantages: 'qewe',
	authorId: 3,
	modules: [
		{
			title: 'фыв',
			description: 'фыв',
			topics: [
				{
					title: 'йцу',
					description: 'фв\n\n',
				},
			],
		},
		{
			title: 'Тест 123',
			description: 'фыв',
			topics: [
				{
					title: 'йцу 2',
					description: 'qweqweqwe asd zxczxc',
				},
			],
		},
	],
};

@Component({
	selector: 'app-course-form',
	templateUrl: './course-form.component.html',
	styleUrls: ['./course-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent implements OnInit {
	private _mode: CourseFormViewMode = CourseFormViewMode.Create;
	private course: CourseReview | null = null;
	private courseMetadata: CourseFormMetadata | null = null;

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

	@Input() public set mode(value: CourseFormViewMode) {
		this._mode = value;
	}

	@Input() public set formData(
		data: CourseReview | EmptyCourseFormDataType
	) {
        console.log('111 form data', data);
		if (data !== EMPTY_COURSE_FORM_DATA) {
			this.course = data;
            const courseFormData = convertCourseToCourseFormData(data);
            this.courseMetadata = courseFormData.metadata;
			this.setCourseModel(courseFormData);
		} else {
			this.addStartModule();
		}
	}

	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter<CourseFormData>();
	@Output() public createReviewVersion = new EventEmitter<CourseFormData>();
	@Output() public update = new EventEmitter<CourseFormData>();

	constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {
		this.courseForm = this.fb.group({
			title: ['', Validators.required],
			description: ['', Validators.required],
			startDate: [null, Validators.required],
			endDate: [null, Validators.required],
			category: ['', Validators.required],
			subcategory: ['', Validators.required],
			userCategory: [null],
			userSubcategory: [null],
			advantages: [null],
			modules: this.fb.array([]),
			editorComments: this.fb.group({
				...getEmptyEditorComments(),
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
		const moduleControl = this.fb.group({
			title: ['', Validators.required],
			description: ['', Validators.required],
			topics: this.fb.array([
				this.fb.group({
					title: ['', Validators.required],
					description: '',
				}),
			]),
		});

		moduleControl.controls['topics'].setValidators([
			moduleTopicsCountValidator(),
		]);
		this.modules.push(moduleControl);

        const moduleCommentsForm = this.getEditorCommentsModules([moduleControl.value], { isEmpty: true });
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

	public onSubmit(
		action: 'review' | 'publish' | 'create' | 'edit' | 'update'
	): void {
		const { valid: isValid } = this.courseForm;
        const { value }: { value: CourseFormData } = this.courseForm;

		if (this.courseMetadata !== null && action === 'create') {
			throw new Error('Cannot create not empty course.');
		}

		switch (action) {
			case 'create': {
				this.publishCourse(value);
				break;
			}
			case 'publish': {
				this.publishCourse(value);
				break;
			}
			case 'review': {
				const { valid: isValid } = this.editorComments;
				if (isValid && this.courseMetadata) {
					value.id = this.courseMetadata.id;
					this.saveReview.emit(value);
				} else {
					console.error('Invalid review form');
				}
				break;
			}
			case 'edit': {
				if (isValid && this.courseMetadata) {
                    value.metadata = this.courseMetadata;
					this.createReviewVersion.emit(value);
				}
				break;
			}

			default:
				break;
		}
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

	private publishCourse(data: CourseFormData) {
		this.publish.emit(data);
	}

	private setCourseModel(course: CourseFormData): void {
		const { modules, editorComments } = course;

		const modulesArray = this.getModulesFormArray(modules);
		const editorModulesArray = this.prepareEditorComments(editorComments, modules);

		this.courseForm.patchValue({
			title: course.title,
			description: course.description,
			startDate: course.startTime,
			endDate: course.endTime,
			category: course.category,
			subcategory: course.subcategory,
			// userCategory: course.userCategory,
			// userSubcategory: course.userSubcategory,
			advantages: course.advantages,
			editorComments: editorComments ?? getEmptyEditorComments(),
		});

		modulesArray.controls.forEach((control) => {
			this.modules.push(control);
		});

		editorModulesArray.forEach((control) => {
			this.editorModules.push(control);
		});
	}

	private getModulesFormArray(modulesData: CourseModule[]): FormArray {
		const array = this.fb.array<FormGroup>([]);
		modulesData.forEach((module) => {
			const topics = this.getTopicsFormArray(module.topics);
			const moduleGroup = this.fb.group({
				title: module.title,
				description: module.description,
				topics: this.fb.array(topics),
			});
			array.push(moduleGroup);
		});

		return array;
	}

	private getTopicsFormArray(topics: CourseTopic[]) {
		return topics.map((topic) => {
			return this.fb.group({
				title: topic.title,
				description: topic.description,
			});
		});
	}

	private prepareEditorComments(editorComments: CourseEditorComments | null, modules: CourseModule[]) {
		if (editorComments?.modules && editorComments.modules.length > 0) {
			return this.getEditorCommentsModules(editorComments.modules);
		}
        return this.getEditorCommentsModules(modules, { isEmpty: true });
	}

	private getEditorCommentsModules(
		modules: Record<string, any>[],
		{ isEmpty }: { isEmpty: boolean } = { isEmpty: false }
	) {
		return modules.map((module) => {
			const topics = this.getEditorCommentsModuleTopics(
				module['topics'],
				{ isEmpty }
			);
			return this.fb.group({
				title: isEmpty ? null : module['title'],
				description: isEmpty ? null : module['description'],
				topics: this.fb.array(topics),
			});
		});
	}

	private getEditorCommentsModuleTopics(
		topics: Record<string, any>[],
		{ isEmpty }: { isEmpty: boolean }
	) {
		return topics.map((topic) => {
			return this.fb.group({
				title: isEmpty ? null : topic['title'],
				description: isEmpty ? null : topic['description'],
			});
		});
	}
}
