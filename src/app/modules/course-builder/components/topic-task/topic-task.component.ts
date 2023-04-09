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
    private courseId: string;

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
        this.uploadFolder = this.uploadService.getFilesFolder(this.courseId, 'tasks', this.form.value.id)
    }

    @Output() public remove = new EventEmitter<void>();

	constructor(private courseBuilder: CourseBuilderService, private uploadService: UploadService) {
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
