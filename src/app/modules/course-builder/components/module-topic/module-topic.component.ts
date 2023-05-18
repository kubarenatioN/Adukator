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
import {
	CourseFormViewMode,
	TopicFormFields,
	WrapperType,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

@Component({
	selector: 'app-module-topic',
	templateUrl: './module-topic.component.html',
	styleUrls: ['./module-topic.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleTopicComponent extends BaseComponent implements OnInit {
	private _form!: FormGroup;

	@Input() public set form(form: FormGroup) {
		this._form = form;
		this.activeSections = {
			[TopicFormFields.Materials]: form.value.materials && form.value.materials.length > 0,
			[TopicFormFields.Theory]: form.value.theory,
			practice: form.value.practice != null,
			[TopicFormFields.TestLink]: form.value.testLink != null,
		};
		this.uploadFolder = this.courseBuilderService.getUploadFolder(
			['topics'],
			this.form.value.id
		);
	}
	@Input() public controlsType!: WrapperType;
	@Output() public saveTopic = new EventEmitter<FormGroup>();

	public uploadFolder: string = '';

	public get form() {
		return this._form;
	}

	public uploadType: 'upload' | 'download' = 'download';
	public shouldPreloadExisting = false;

	public get controlId(): string {
		return this._form.value.id;
	}

	public get practiceFormGroup() {
		return this.form.controls['practice'] as FormGroup;
	}

	public get tasksFormArray(): FormArray<FormGroup> {
		const practiceForm = this.practiceFormGroup;
		if (practiceForm.value) {
			return practiceForm.controls['tasks'] as FormArray<FormGroup>;
		}
		return new FormArray([] as FormGroup[]);
	}

	public activeSections: { [key: string]: boolean } = {
		[TopicFormFields.Materials]: false,
		[TopicFormFields.Theory]: false,
		[TopicFormFields.TestLink]: false,
		practice: false,
	};
	public fields = TopicFormFields;

	constructor(
		private fbHelper: FormBuilderHelper,
		private courseBuilderService: CourseBuilderService
	) {
		super();
	}

	public ngOnInit(): void {
		this.form.valueChanges
			.pipe(takeUntil(this.componentLifecycle$))
			.subscribe((value) => {
				// console.log('111 change topic', value);
			});

		this.courseBuilderService.viewData$
			.pipe(takeUntil(this.componentLifecycle$))
			.subscribe((viewData) => {
				const { mode, viewPath } = viewData;
				// const { type: viewType } = viewPath

				this.shouldPreloadExisting = mode !== CourseFormViewMode.Create;
				this.controlsType =
					mode === CourseFormViewMode.Review ? 'review' : 'edit';
				this.uploadType =
					this.controlsType === 'edit' ? 'upload' : 'download';
			});
	}

	public onAddSection(sectionType: string) {
		if (sectionType === 'practice' && (!this.practiceFormGroup || !this.practiceFormGroup.value)) {
			this.onAddPracticeSection();
		}
		this.activeSections[sectionType] = true;
	}

	public onRemoveSection(sectionType: string) {
		this.activeSections[sectionType] = false;
		if (sectionType === 'practice') {
			this.form.setControl(sectionType, null);
		} else {
			this.form.controls[sectionType].setValue(null)
		}
	}

	public onAddTask() {
		const taskForm = this.fbHelper.getTopicTaskForm();
		this.tasksFormArray.push(taskForm);
	}

	public onRemoveTaskAt(index: number) {
		if (index === 0) {
			return;
		}
		this.tasksFormArray.removeAt(index);
	}

	public onUploadFilesChanged(materials: string[]): void {
		this.form.patchValue({
			materials,
		});
	}

	private onAddPracticeSection() {
		const practiceForm = this.fbHelper.getTopicPracticeForm();
		this.form.setControl('practice', practiceForm);
	}
}
