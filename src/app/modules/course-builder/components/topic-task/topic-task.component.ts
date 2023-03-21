import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseHierarchyComponent } from 'src/app/typings/course.types';

@Component({
	selector: 'app-topic-task',
	templateUrl: './topic-task.component.html',
	styleUrls: ['./topic-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTaskComponent {
    private _hierarchy: CourseHierarchyComponent | null = null;
    public uploadPath = ''
    
    @Input() public form!: FormGroup
    @Input() public set hierarchy(value: CourseHierarchyComponent) {
        this._hierarchy = value;
        this.uploadPath = UploadHelper.getTaskUploadFolder(value);
    }

    @Output() public remove = new EventEmitter<void>();

	constructor() {}

    public onUploadFilesChanged(materials: string[]) {
        this.form.patchValue({
            materials,
        });
    }
}
