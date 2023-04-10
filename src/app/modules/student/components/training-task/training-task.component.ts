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
import { CourseTrainingService } from 'src/app/services/course-training.service';
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
    private _task!: TopicTask;
	private initialValue!: TaskAnswer;
    private taskStore$ = new BehaviorSubject<TopicTask>({} as TopicTask)
    private uploadFolderStore$ = new BehaviorSubject<string>('')

	@Input() public set task(value: TopicTask) {
        this._task = value;
    }

	@Output() public send = new EventEmitter<TaskAnswer>();

	public form;
	public uploadFolder = '';
	// public uploadFolder$ = this.uploadFolderStore$.asObservable();
	public uploadLabel = UploadLabel;

    public get controlId(): string {
        return this.task.id
    }

    public get task(): TopicTask {
        return this._task
    }

	constructor(
		private trainingService: CourseTrainingService,
        private uploadService: UploadService,
		private fbHelper: FormBuilderHelper
	) {
		this.form = this.fbHelper.getTrainingTaskForm(null);
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { task } = changes
        if (task && !task.firstChange && task.previousValue.id !== task.currentValue.id) {
            // this.taskStore$.next(task.currentValue)
            console.log('task', task.currentValue.id);
        }
    }

	ngOnInit(): void {
        
        // combineLatest([
        //     this.trainingService.course$,
        //     this.taskStore$,
        // ]).subscribe(([course, task]) => {
        //     const uploadFolder = this.uploadService.getFilesFolder(course.id, 'tasks', task.id)
        //     this.uploadFolderStore$.next(uploadFolder) 
        // })

        this.trainingService.getUploadFolder('tasks', this.task.id).pipe(
            take(1)
        ).subscribe(folder => {
            this.uploadFolder = folder
        })

		// Fill with task data
        this.form = this.fbHelper.getTrainingTaskForm(this.task);

		this.initialValue = this.fbHelper.getTrainingTaskDefaultValue(
			this.task.id
		);
	}

	public onSend() {
		const answer = this.form.value as TaskAnswer;
		if (answer.files.length > -1) {
			this.send.emit(answer);
			this.form.reset(this.initialValue);
		} else {
			console.warn('No files attached');
		}
	}
}
