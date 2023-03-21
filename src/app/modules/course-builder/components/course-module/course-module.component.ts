import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { CourseHierarchyComponent } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-module',
	templateUrl: './course-module.component.html',
	styleUrls: ['./course-module.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseModuleComponent implements OnInit {
    private _editorCommentsForm: FormGroup | null = null;
    
	@Input() public hierarchy!: CourseHierarchyComponent;
	@Input() public form!: FormGroup;

    // form for editor comments
	@Input() public set editorModulesForm(value: FormGroup | null) {
        this._editorCommentsForm = value;
    }

	@Output() public changeTitle = new EventEmitter<string>();

	public get topics(): FormArray {
		return this.form.get('topics') as FormArray;
	}

	public get topicsFormGroups(): FormGroup[] {
		return this.topics.controls as FormGroup[];
	}

    public get editorModulesForm() {
        return this._editorCommentsForm;
    }

    public topicsEditorCommentsForm(i: number): FormGroup | null {
        if (this.editorModulesForm === null) {
            return null;
        }
        return (this.editorModulesForm.controls['topics'] as FormArray).at(i) as FormGroup
    }

	public get title(): string {
		if (this.form) {
			return this.form.get('title')?.value || '';
		}
		return '';
	}

	constructor(
        private fbHelper: FormBuilderHelper,
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

    public getHierarchy(topicIndex: number): CourseHierarchyComponent {
        return {
            ...this.hierarchy,
            topic: topicIndex
        }
    }

    private createNewTopicFormModel() {
        return this.fbHelper.getEmptyTopic()
    }
}
