import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
	public courseForm: FormGroup;

	public get modules(): FormArray {
		return this.courseForm.get('modules') as FormArray;
	}

	public get modulesControls(): FormGroup[] {
		return this.modules.controls as FormGroup[];
	}

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
		});
	}

	ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			console.log('111 course form changed', res, this.courseForm);
		});

		this.addModule();
		this.cd.markForCheck();
	}

	public addModule(): void {
		const moduleControl = this.fb.group({
			title: ['', Validators.required],
			description: ['', Validators.required],
            topics: this.fb.array([])
		});

        moduleControl.controls['topics'].setValidators([
            moduleTopicsCountValidator()
        ])
		this.modules.push(moduleControl);
	}

	public removeModule(index: number): void {
		this.modules.removeAt(index);
	}

	public drop(event: CdkDragDrop<FormGroup[]>) {
		moveItemInArray(
			this.modules.controls,
			event.previousIndex,
			event.currentIndex
		);
	}

    public onSubmit(action: 'draft' | 'publish'): void {
        const {valid: isValid, value, errors} = this.courseForm;
        if (isValid) {
            console.log(action, value);
        }
        else {
            console.log(action, errors);
        }
    }

    public onChangeCustomCategory(change: MatCheckboxChange, field: 'userCategory' | 'userSubcategory') {
        const { checked } = change;
        if(!checked) {
            this.courseForm?.get(field)?.setValue('');
        }
    }
}
