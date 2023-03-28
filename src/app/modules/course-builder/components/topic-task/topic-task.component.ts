import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { WrapperType } from 'src/app/typings/course.types';

@Component({
	selector: 'app-topic-task',
	templateUrl: './topic-task.component.html',
	styleUrls: ['./topic-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTaskComponent implements OnInit {
    private _form!: FormGroup;
    public uploadPath = ''
    
    public get form() {
        return this._form;
    }

    @Input() public controlsType!: WrapperType;

    @Input() public set form(value: FormGroup) {
        this._form = value;
        this.uploadPath = UploadHelper.getTaskReviewUploadFolder(value);
    }

    @Output() public remove = new EventEmitter<void>();

	constructor() {}

    ngOnInit(): void {

    }

    public onUploadFilesChanged(materials: string[]) {
        this.form.patchValue({
            materials,
        });
    }
}
