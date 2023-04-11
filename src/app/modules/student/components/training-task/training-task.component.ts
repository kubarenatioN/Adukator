import {
	ChangeDetectionStrategy,
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
import { BehaviorSubject, combineLatest, take } from 'rxjs';
import { UploadBoxComponent } from 'src/app/components/upload-box/upload-box.component';
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
	private initialValue:
		| Partial<{
				id: string | null;
				files: string[] | null;
				comment: string | null;
		  }>
		| undefined;

	@Input() public task!: TopicTask;

	@Output() public send = new EventEmitter<TaskAnswer>();

    @ViewChild('uploadBox') public uploadBoxRef!: ElementRef<UploadBoxComponent>

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
		private uploadService: UploadService,
		private fbHelper: FormBuilderHelper
	) { }

	ngOnChanges(changes: SimpleChanges): void {}

	ngOnInit(): void {
		this.form = this.fbHelper.getTrainingTaskForm(this.task);
		this.initialValue = this.form.value;

		this.trainingService
			.getUploadFolders([
				{ segments: ['tasks'], controlId: this.task.id },
				{ segments: ['training', 'tasks'], controlId: this.task.id },
			])
			.pipe(take(1))
			.subscribe((folders) => {
				this.taskMaterialsFolder = folders[0];
				this.uploadFilesFolder = folders[1];
			});

		// this.form.valueChanges.subscribe((res: any) => {
		// 	console.log('task model', res);
		// });
	}

	public onUpload(files: string[]) {
		this.form.controls.files.setValue(files);
	}

	public onSend() {
		const answer = this.form.value as TaskAnswer;
		if (answer.files.length > 0) {
			this.send.emit(answer);
			this.form.reset(this.initialValue);
            this.uploadBoxRef.nativeElement.clearBox()
		} else {
			console.warn('No files attached');
		}
	}
}
