import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { BaseComponent } from 'src/app/shared/base.component';
import { WrapperType } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-module',
	templateUrl: './course-module.component.html',
	styleUrls: ['./course-module.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseModuleComponent extends BaseComponent implements OnInit {
	@Input() public form!: FormGroup;
	@Input() public controlsType!: WrapperType;

	@Output() public changeTitle = new EventEmitter<string>();

	public get topics(): FormArray {
		return this.form.get('topics') as FormArray;
	}

	public get topicsFormGroups(): FormGroup[] {
		return this.topics.controls as FormGroup[];
	}

	public get title(): string {
		if (this.form) {
			return this.form.get('title')?.value || '';
		}
		return '';
	}

	constructor(private fbHelper: FormBuilderHelper) {
		super();
	}

	public ngOnInit(): void {
		this.form.valueChanges
			.pipe(takeUntil(this.componentLifecycle$))
			.subscribe((res) => {
				// console.log('111 module form changed', res);
			});
	}

	// public addTopic(): void {
	//     const newTopic = this.fbHelper.getTopicForm();
	//     this.topics.push(newTopic);
	// }

	public onRemoveTopic(index: number) {
		if (index === 0) {
			return;
		}
		this.topics.removeAt(index);
	}
}
