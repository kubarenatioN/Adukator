import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseHierarchyComponent } from 'src/app/typings/course.types';

type SectionType = 'materials' | 'theory' | 'practice' | 'test'

@Component({
	selector: 'app-module-topic',
	templateUrl: './module-topic.component.html',
	styleUrls: ['./module-topic.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleTopicComponent extends BaseComponent implements OnInit {
	@Input() public hierarchy!: CourseHierarchyComponent;
	@Input() public form!: FormGroup;

    @Output() public saveTopic = new EventEmitter<FormGroup>();

    public uploadFolder: string | null = null;
    
    public get practiceFormGroup() {
        return this.form.controls['practice'] as FormGroup;
    }

    public get hasPracticeFormGroup(): boolean {
        return this.practiceFormGroup.value !== null;
    }

    public get tasksFormArray(): FormArray<FormGroup> {
        const practiceForm = this.practiceFormGroup;
        if (practiceForm.value) {
            return practiceForm.controls['tasks'] as FormArray<FormGroup>;
        }
        return new FormArray([] as FormGroup[]);
    }

    public activeSections = {
        materials: false,
        practice: false,
        theory: false,
        test: false,
    }

	constructor(private fbHelper: FormBuilderHelper) {
        super()
    }

	public ngOnInit(): void {
        if (!this.form) {
            this.form = this.fbHelper.getTopicForm();
        }
        
        this.form.valueChanges
            .pipe(takeUntil(this.componentLifecycle$))
            .subscribe(value => {
                // console.log('111 change topic', value);
            })
        this.uploadFolder = UploadHelper.getTopicUploadFolder(this.hierarchy);
    }

    public onAddSection(sectionType: SectionType) {
        if (sectionType === 'practice' && this.practiceFormGroup.value === null) {
            this.onAddPracticeSection();
        }
        this.activeSections[sectionType] = true;
    }

    public onRemoveSection(sectionType: SectionType) {
        this.activeSections[sectionType] = false
    }

    public onAddTask() {
        const taskForm = this.fbHelper.getTopicTaskForm()
        this.tasksFormArray.push(taskForm);
    }

    public onRemoveTaskAt(index: number) {
        if (index === 0) {
            return;
        }
        this.tasksFormArray.removeAt(index);
    }

    public getHierarchy(taskIndex: number): CourseHierarchyComponent {
        return {
            ...this.hierarchy,
            task: taskIndex,
        }
    }

    public onUploadFilesChanged(materials: string[]): void {
        this.form.patchValue({
            materials,
        })
    }

    private onAddPracticeSection() {
        this.form.controls['practice'] = this.fbHelper.getTopicPracticeForm()
    }
}
