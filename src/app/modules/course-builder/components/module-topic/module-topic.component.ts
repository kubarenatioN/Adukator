import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseBuilderViewData, CourseBuilderViewType, CourseFormViewMode, WrapperType } from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

type SectionType = 'materials' | 'theory' | 'practice' | 'test'

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
            materials: form.value.materials && form.value.materials.length > 0,
            theory: form.value.theory,
            practice: form.value.practice,
            test: form.value.testLink,
        }
        this.uploadFolder = this.courseBuilderService.getUploadFolder(['topics'], this.form.value.id)
    };
	@Input() public controlsType!: WrapperType;
    @Output() public saveTopic = new EventEmitter<FormGroup>();

    public uploadFolder: string = '';
    
    public get form() {
        return this._form;
    }

    public uploadType: 'upload' | 'download' = 'download'
    public shouldPreloadExisting = false;
    
    public get controlId(): string {
        return this._form.value.id;
    }
    
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

	constructor(
        private fbHelper: FormBuilderHelper,
        private courseBuilderService: CourseBuilderService,
    ) {
        super()
    }

	public ngOnInit(): void {
        this.form.valueChanges
            .pipe(takeUntil(this.componentLifecycle$))
            .subscribe(value => {
                // console.log('111 change topic', value);
            })

        this.courseBuilderService.viewData$
        .pipe(takeUntil(this.componentLifecycle$))
        .subscribe(viewData => {
            const { mode, viewPath } = viewData
            const { type: viewType } = viewPath
    
            this.shouldPreloadExisting = mode !== CourseFormViewMode.Create
            this.controlsType = mode === CourseFormViewMode.Review ? 'review' : 'edit'
            this.uploadType = this.controlsType === 'edit' ? 'upload' : 'download'
        })
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

    public onUploadFilesChanged(materials: string[]): void {
        this.form.patchValue({
            materials,
        })
    }

    private onAddPracticeSection() {
        const practiceForm = this.fbHelper.getTopicPracticeForm();
        this.form.setControl('practice', practiceForm);
    }
}
