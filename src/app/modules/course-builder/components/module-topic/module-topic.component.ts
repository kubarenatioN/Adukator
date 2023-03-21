import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseHierarchyComponent } from 'src/app/typings/course.types';

type SectionType = 'materials' | 'theory' | 'practice' | 'test'

@Component({
	selector: 'app-module-topic',
	templateUrl: './module-topic.component.html',
	styleUrls: ['./module-topic.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleTopicComponent implements OnInit {
	@Input() public order!: number;
	@Input() public hierarchy!: CourseHierarchyComponent;
	@Input() public form!: FormGroup;

    // form for editor comments
	@Input() public editorForm: FormGroup | null = null;

    @Output() public saveTopic = new EventEmitter<FormGroup>();
    @Output() public removeTopic = new EventEmitter<void>();

    public uploadFolder: string | null = null;

    public get practiceFormGroup() {
        return this.form.controls['practice'] as FormGroup;
    }

    public get taskForms(): FormGroup[] {
        return this.tasksArray.controls as FormGroup[];
    }

    private get tasksArray() {
        return this.practiceFormGroup.controls['tasks'] as FormArray;
    }

    public activeSections = {
        materials: false,
        practice: false,
        theory: false,
        test: false,
    }

	constructor(private fb: FormBuilderHelper) { }

	ngOnInit(): void {
        console.log(this.tasksArray);
        if (!this.form) {
            this.form = this.fb.getEmptyTopic();
        }
        
        this.form.valueChanges.subscribe(value => {
            console.log('111 change topic', value);
        })
        this.uploadFolder = UploadHelper.getTopicUploadFolder(this.hierarchy);
    }

    public onRemove(): void {
        if (this.order === 0) {
            return;
        }
        this.removeTopic.emit();
    }

    public onAddSection(sectionType: SectionType) {
        this.activeSections[sectionType] = true
    }

    public onRemoveSection(sectionType: SectionType) {
        this.activeSections[sectionType] = false
    }

    public onAddTask() {
        const taskForm = this.fb.getTopicTask()
        this.tasksArray.push(taskForm);
    }

    public onRemoveTaskAt(index: number) {
        this.tasksArray.removeAt(index);
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
}
