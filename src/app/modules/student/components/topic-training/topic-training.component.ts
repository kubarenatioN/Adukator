import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getTodayTime } from 'src/app/helpers/date-fns.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseTrainingService } from 'src/app/services/course-training.service';
import { TaskAnswer } from 'src/app/typings/course-training.types';
import { ModuleTopic } from 'src/app/typings/course.types';

@Component({
	selector: 'app-topic-training',
	templateUrl: './topic-training.component.html',
	styleUrls: ['./topic-training.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTrainingComponent implements OnInit {
	@Input() public topic!: ModuleTopic;
    @Input() public folderPath!: string; 

    public topicFolderPath!: string
    public tasksFolderPaths: string[] = []

    public get isActual() {
        return this.topic.isActual
    };

    public get isPast() {
        return this.topic.isPast
    };

	constructor(private trainingService: CourseTrainingService) {}

	ngOnInit(): void {
        this.trainingService.course$.subscribe(course => {
            if (course) {
                this.topicFolderPath = UploadHelper.getTopicUploadFolder('course', course, this.topic.id);

                this.tasksFolderPaths = this.topic.practice?.tasks.map(task => {
                    return UploadHelper.getTopicUploadFolder('course', course, task.id)
                }) ?? [];
            }
        });
    }

    public onSendTaskAnswer(answer: TaskAnswer) {
        console.log('111 send answer', answer.id);
    }
}
