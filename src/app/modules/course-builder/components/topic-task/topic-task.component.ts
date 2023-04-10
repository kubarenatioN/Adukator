import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { UploadService } from 'src/app/services/upload.service';
import { WrapperType } from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

@Component({
	selector: 'app-topic-task',
	templateUrl: './topic-task.component.html',
	styleUrls: ['./topic-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTaskComponent implements OnInit {
    private _form!: FormGroup;

    public uploadFolder = ''

    public get controlId(): string {
        return this.form.value.id;
    }
    
    public get form() {
        return this._form;
    }

    public get uploadType() {
        return this.controlsType === 'edit' ? 'upload' : 'download'
    }

    @Input() public controlsType!: WrapperType;

    @Input() public set form(value: FormGroup) {
        this._form = value;
    }

    @Output() public remove = new EventEmitter<void>();

	constructor(private courseBuilder: CourseBuilderService) {
    }

    ngOnInit(): void {
        this.uploadFolder = this.courseBuilder.getUploadFolder('tasks', this.form.value.id)
    }

    public onUploadFilesChanged(materials: string[]) {
        this.form.patchValue({
            materials,
        });
    }
}
