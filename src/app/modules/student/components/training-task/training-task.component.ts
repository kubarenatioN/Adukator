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
	@Input() public task!: TopicTask;

    @Output() public send = new EventEmitter<TaskAnswer>()

    public form;
    public uploadFolder: string | null = null;
    public uploadLabel = UploadLabel;

	constructor(private trainingService: CourseTrainingService, private fbHelper: FormBuilderHelper) {
        this.form = this.fbHelper.getTrainingTaskForm()
    }

	ngOnInit(): void {
        this.form.get('id')?.setValue(this.task.id);

        const course = this.trainingService.course;
        if (course) {
            this.uploadFolder = UploadHelper.getTrainingTaskUploadFolder('course', course, this.task.id);
        }
    }

    public onSend() {
        this.send.emit(this.form.value as TaskAnswer);
    }
}
