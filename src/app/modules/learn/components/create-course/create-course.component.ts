import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpHeaders } from '@angular/common/http';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataRequestPayload, DataService } from 'src/app/services/data.service';
import { CreateCourseFormData } from 'src/app/typings/course.types';

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

	constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private dataService: DataService) {
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
            if (action === 'publish') {
                this.publishCourse(value)
            }
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

    private processCourseFormData(data: CreateCourseFormData): CreateCourseFormData {
        return data;
    }

    private publishCourse(data: CreateCourseFormData) {
        const processedCourseData = this.processCourseFormData(data);
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.CreateCourse, {
            course: processedCourseData
        })
        this.dataService.send(payload).subscribe(res => {
            console.log('111 create course response', res)
        })
    }
}
