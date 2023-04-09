import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
    Output,
} from '@angular/core';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseTrainingService } from 'src/app/services/course-training.service';
import { TaskAnswer } from 'src/app/typings/course-training.types';
import { TopicTask } from 'src/app/typings/course.types';

const UploadLabel = 'Загрузите файлы с выполненным заданием сюда.'

@Component({
	selector: 'app-training-task',
	templateUrl: './training-task.component.html',
	styleUrls: ['./training-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingTaskComponent implements OnInit {
    private initialValue!: TaskAnswer;
	@Input() public task!: TopicTask;

    @Output() public send = new EventEmitter<TaskAnswer>()

    public form;
    public uploadFolder: string = 'fixme';
    public uploadLabel = UploadLabel;

	constructor(private trainingService: CourseTrainingService, private fbHelper: FormBuilderHelper) {
        this.form = this.fbHelper.getTrainingTaskForm();
    }

	ngOnInit(): void {
        this.form.get('id')?.setValue(this.task.id);
        this.initialValue = this.fbHelper.getTrainingTaskDefaultValue(this.task.id);

        const course = this.trainingService.course;
        if (course) {
            this.uploadFolder = UploadHelper.getTrainingTaskUploadFolder('course', course, this.task.id);
        }
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
