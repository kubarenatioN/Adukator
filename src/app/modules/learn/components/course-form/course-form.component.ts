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
import { EmptyCourseFormDataType, EMPTY_COURSE_FORM_DATA } from 'src/app/constants/common.constants';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import { CourseFormData, CourseFormViewMode, CourseModule, CourseTopic } from 'src/app/typings/course.types';

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
    private _formData: CourseFormData | null = null
    
	public courseForm: FormGroup;

	public get modules(): FormArray {
		return this.courseForm.get('modules') as FormArray;
	}

	public get modulesControls(): FormGroup[] {
		return this.modules.controls as FormGroup[];
	}

    @Input() public mode: CourseFormViewMode = CourseFormViewMode.Create;

    @Input() public set formData(data: CourseFormData | EmptyCourseFormDataType) {
        console.log(data);
        if (data !== EMPTY_COURSE_FORM_DATA) {   
            this.setCourseModel(data);
        }
    }

    @Output() public publish = new EventEmitter<CourseFormData>();
    @Output() public saveDraft = new EventEmitter<CourseFormData>();
    @Output() public update = new EventEmitter<CourseFormData>();

	constructor(
		private fb: FormBuilder,
		private cd: ChangeDetectorRef,
	) {
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
		});
	}

	ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			console.log('111 course form changed', res, this.courseForm);
		});

        if (this.mode === 'create') {
            this.addModule();
            this.cd.markForCheck();
        }
	}

	public addModule(): void {
		const moduleControl = this.fb.group({
			title: ['', Validators.required],
			description: ['', Validators.required],
			topics: this.fb.array([]),
		});

		moduleControl.controls['topics'].setValidators([
			moduleTopicsCountValidator(),
		]);
		this.modules.push(moduleControl);
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

	public drop(event: CdkDragDrop<FormGroup[]>) {
		moveItemInArray(
			this.modules.controls,
			event.previousIndex,
			event.currentIndex
		);
	}

	public onSubmit(action: 'draft' | 'publish' | 'update'): void {
		const { valid: isValid, value, errors } = this.courseForm;
		if (!isValid) {
            return;
        } 
        switch (action) {
            case 'publish':
				this.publishCourse(value);                
                break;
            case 'draft':
				this.saveDraftCourse(value);                
                break;
            case 'update':
				this.updateCourse(value);                
                break;
        }
	}

	private publishCourse(data: CourseFormData) {
		this.publish.emit(data)
	}

	private saveDraftCourse(data: CourseFormData) {
		this.publish.emit(data)
	}

	private updateCourse(data: CourseFormData) {
		this.publish.emit(data)
	}

    private setCourseModel(course: CourseFormData): void {
        const { modules } = course

        this.courseForm.patchValue({
			title: course.title,
			description: course.description,
			startDate: course.startTime,
			endDate: course.endTime,
			category: course.category,
			subcategory: course.subcategory,
			userCategory: course.userCategory,
			userSubcategory: course.userSubcategory,
			advantages: course.advantages,
		})

        this.modules.controls = this.getModulesFormArray(modules)
    }

    private getModulesFormArray(modulesData: CourseModule[]) {
        return modulesData.map(module => {
            const topics = this.getTopicsFormArray(module.topics)
            return this.fb.group({
                title: module.title,
                description: module.description,
                topics: this.fb.array(topics)
            })
        })
    }

    private getTopicsFormArray(topics: CourseTopic[]) {
        return topics.map(topic => {
            return this.fb.group({
                title: topic.title,
                description: topic.description
            })
        })
    }
}
