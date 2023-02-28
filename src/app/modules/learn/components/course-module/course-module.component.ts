import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-course-module',
	templateUrl: './course-module.component.html',
	styleUrls: ['./course-module.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseModuleComponent implements OnInit {
	@Input() public form!: FormGroup;

    // form for editor comments
	@Input() public editorModulesForm!: FormGroup;

	@Output() public changeTitle = new EventEmitter<string>();

	public get topics(): FormArray {
		return this.form.get('topics') as FormArray;
	}

	public get topicsFormGroups(): FormGroup[] {
		return this.topics.controls as FormGroup[];
	}

    public topicsEditorCommentsForm(i: number): FormGroup {
        return (this.editorModulesForm.controls['topics'] as FormArray).at(i) as FormGroup
    }

	public get title(): string {
		if (this.form) {
			return this.form.get('title')?.value || '';
		}
		return '';
	}

	constructor(
		private fb: FormBuilder,
	) {}

	public ngOnInit(): void {
		this.form.valueChanges.subscribe((res) => {
			console.log('111 module form changed', res);
		});
	}

    public addTopic(): void {
        const newTopic = this.createNewTopicFormModel();
        this.topics.push(newTopic);
    }

	public onRemoveTopic(index: number) {
		this.topics.removeAt(index);
	}

    private createNewTopicFormModel() {
        return this.fb.group({
            title: ['', Validators.required],
            description: [''],
        })
    }
}
