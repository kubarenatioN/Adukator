import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, take } from 'rxjs';
import { UploadBoxComponent } from 'src/app/components/upload-box/upload-box.component';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { CourseTrainingService } from 'src/app/modules/student/services/course-training.service';
import { TrainingProgressService } from 'src/app/services/training-progress.service';
import { UploadService } from 'src/app/services/upload.service';
import { TopicTask } from 'src/app/typings/course.types';
import { TrainingReply, TrainingReplyMessage, TrainingTaskAnswer } from 'src/app/typings/training.types';

const UploadLabel = 'Загрузите файлы с выполненным заданием сюда.';

@Component({
	selector: 'app-training-task',
	templateUrl: './training-task.component.html',
	styleUrls: ['./training-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingTaskComponent implements OnInit, OnChanges {
	private initialValue:
		| Partial<{
				id: string | null;
				files: string[] | null;
				comment: string | null;
		  }>
		| undefined;

	@Input() public task!: TopicTask;

	@Output() public send = new EventEmitter<TrainingReplyMessage>();

    public clearUploadBox$ = new EventEmitter<void>();

	public form!: FormGroup<{
		id: FormControl<string | null>;
		files: FormControl<string[] | null>;
		comment: FormControl<string | null>;
	}>;
	public uploadFilesFolder = '';
	public taskMaterialsFolder = '';
	public uploadLabel = UploadLabel;

	public get controlId(): string {
		return this.task.id;
	}

	constructor(
		private trainingService: CourseTrainingService,
		private trainingProgress: TrainingProgressService,
		private uploadService: UploadService,
		private fbHelper: FormBuilderHelper,
		private cdRef: ChangeDetectorRef,
	) { }

	ngOnChanges(changes: SimpleChanges): void {}

	ngOnInit(): void {
		this.form = this.fbHelper.getTrainingTaskForm(this.task);
		this.initialValue = this.form.value;

		this.trainingProgress.profile$
			.subscribe(profile => {
                this.taskMaterialsFolder = this.uploadService.getFilesFolder(
                    'course',
                    profile.training.course.uuid, 
                    'tasks', 
                    this.controlId
                )
                this.uploadFilesFolder = this.uploadService.getFilesFolder(
                    'training',
                    profile.uuid, 
                    'tasks', 
                    this.controlId
                )
                this.cdRef.detectChanges()
			});
	}

	public onUpload(files: string[]) {
		this.form.controls.files.setValue(files);
	}

	public onSend() {
		const answer = this.form.value as TrainingTaskAnswer;
		if (answer.files.length > 0) {
			this.send.emit({
                type: 'task',
                data: answer,
                taskId: this.task.id
            });
			this.form.reset(this.initialValue);
            this.clearUploadBox$.emit()
		} else {
			console.warn('No files attached');
		}
	}
}
