import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
    SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, combineLatest, take } from 'rxjs';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { CourseTrainingService } from 'src/app/modules/student/services/course-training.service';
import { UploadService } from 'src/app/services/upload.service';
import { TaskAnswer } from 'src/app/typings/course-training.types';
import { TopicTask } from 'src/app/typings/course.types';

const UploadLabel = 'Загрузите файлы с выполненным заданием сюда.';

@Component({
	selector: 'app-training-task',
	templateUrl: './training-task.component.html',
	styleUrls: ['./training-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingTaskComponent implements OnInit, OnChanges {
	private initialValue!: TaskAnswer;

	@Input() public task!: TopicTask

	@Output() public send = new EventEmitter<TaskAnswer>();

	public form;
	public uploadFilesFolder = '';
	public taskMaterialsFolder = '';
	public uploadLabel = UploadLabel;

    public get controlId(): string {
        return this.task.id
    }

	constructor(
		private trainingService: CourseTrainingService,
        private uploadService: UploadService,
		private fbHelper: FormBuilderHelper
	) {
		this.form = this.fbHelper.getTrainingTaskForm(null);
    }

    ngOnChanges(changes: SimpleChanges): void {
        
    }

	ngOnInit(): void {
        this.trainingService.getUploadFolders([
            { segments: ['tasks'], controlId: this.task.id },
            { segments: ['training', 'tasks'], controlId: this.task.id },
        ]).pipe(
            take(1)
        ).subscribe(folders => {
            this.taskMaterialsFolder = folders[0]
            this.uploadFilesFolder = folders[1]
        })

        // Fill with task data
        this.form = this.fbHelper.getTrainingTaskForm(this.task);

        this.form.valueChanges.subscribe(res => {
            console.log('task model', res);
        })

		// this.initialValue = this.fbHelper.getTrainingTaskDefaultValue(
		// 	this.task.id
		// );
	}

    public onUpload(files: string[]) {
        this.form.controls.files.setValue(files)
    }

	public onSend() {
		const answer = this.form.value as TaskAnswer;
		if (answer.files.length > -1) {
			this.send.emit(answer);
			this.form.reset();
		} else {
			console.warn('No files attached');
		}
	}
}
