import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UploadHelper } from 'src/app/helpers/upload.helper';
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
    private courseId: string | null = null;

    public uploadPath = ''
    public tempFolder = ''

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
        this.uploadPath = this.courseBuilder.getFilesFolder('tasks', this.form.value.id)
        this.tempFolder = this.courseBuilder.getFilesFolder('tasks', this.form.value.id)
    }

    @Output() public remove = new EventEmitter<void>();

	constructor(private courseBuilder: CourseBuilderService) {
        this.courseId = this.courseBuilder.courseId
    }

    ngOnInit(): void {

    }

    public onUploadFilesChanged(materials: string[]) {
        this.form.patchValue({
            materials,
        });
    }
}
