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
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import {
	NetworkHelper,
	NetworkRequestKey,
} from 'src/app/helpers/network.helper';
import { CoursesService } from 'src/app/services/courses.service';
import { DataService } from 'src/app/services/data.service';
import { CourseFormData, CourseModule } from 'src/app/typings/course.types';

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
					title: 'йцу',
					description: '',
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

    public mode: 'create' | 'update' = 'create'

    @Input() public set formData(data: CourseFormData | null) {
        if (data) {
            this.setCourseModel(data);
            this.mode = 'update'
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
            console.log(this.modules.value);
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

        const controls = this.getModulesFormArray(modules)
        console.log(controls);
        this.modules.controls = controls
        console.log(this.modules.controls);
        // this.modules.setValue(modules)
    }

    private getModulesFormArray(modules: CourseModule[]) {
        return modules.map(module => {
            return this.fb.group({
                title: module.title,
                description: module.description,
                topics: this.fb.array([])
            })
        })
    }
}
