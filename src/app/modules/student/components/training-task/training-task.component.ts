import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadService } from 'src/app/services/upload.service';
import { TopicTask } from 'src/app/typings/course.types';
import { TrainingReplyMessage, TrainingTaskAnswer } from 'src/app/typings/training.types';
import { StudentTrainingService } from '../../services/student-training.service';

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
	@Input() public isActual!: boolean

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
		private trainingService: StudentTrainingService,
		private uploadService: UploadService,
		private fbHelper: FormBuilderHelper,
		private cdRef: ChangeDetectorRef,
	) { }

	ngOnChanges(changes: SimpleChanges): void {}

	ngOnInit(): void {
		this.form = this.fbHelper.getTrainingTaskForm(this.task);
		this.initialValue = this.form.value;

		this.trainingService.profile$
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
                    this.controlId
                )
                this.cdRef.detectChanges()
			});
	}

	public onUpload(files: string[]) {
		this.form.controls.files.setValue(files);
	}

	public onSend() {
		const { files, comment, id } = this.form.value;

        if (files && files?.length > 0 && id) {
			this.send.emit({
                files,
                comment: comment ? comment : undefined,
                taskId: this.task.id
            });
			this.form.reset(this.initialValue);
            this.clearUploadBox$.emit()
		} else {
			console.warn('No files attached');
		}
	}
}
