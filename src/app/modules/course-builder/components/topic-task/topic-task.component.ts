import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseFormViewMode, WrapperType } from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

@Component({
	selector: 'app-topic-task',
	templateUrl: './topic-task.component.html',
	styleUrls: ['./topic-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTaskComponent extends BaseComponent implements OnInit {
    private _form!: FormGroup;

    public uploadFolder = ''

    public get controlId(): string {
        return this.form.value.id;
    }
    
    public get form() {
        return this._form;
    }

    public uploadType!: 'upload' | 'download';
    public shouldPreloadExisting = false;
    public controlsType!: WrapperType;

    @Input() public set form(value: FormGroup) {
        this._form = value;
    }

    @Output() public remove = new EventEmitter<void>();

	constructor(private courseBuilder: CourseBuilderService) {
        super()
    }

    ngOnInit(): void {
        this.uploadFolder = this.courseBuilder.getUploadFolder('tasks', this.form.value.id)
        this.courseBuilder.viewData$.pipe(
            takeUntil(this.componentLifecycle$)
        ).subscribe(viewData => {
            const { mode, metadata, viewPath } = viewData
            this.shouldPreloadExisting = mode !== CourseFormViewMode.Create
            this.controlsType = mode === CourseFormViewMode.Review ? 'review' : 'edit'
            this.uploadType = this.controlsType === 'edit' ? 'upload' : 'download'
        })
    }

    public onUploadFilesChanged(materials: string[]) {
        this.form.patchValue({
            materials,
        });
    }
}
