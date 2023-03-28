import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseTrainingService } from 'src/app/services/course-training.service';
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

	constructor(private trainingService: CourseTrainingService) {}

	ngOnInit(): void {
        this.trainingService.course$.subscribe(course => {
            if (course) {
                this.topicFolderPath = UploadHelper.getTopicUploadFolder('object', course, this.topic.id);

                this.tasksFolderPaths = this.topic.practice?.tasks.map(task => {
                    return UploadHelper.getTopicUploadFolder('object', course, task.id)
                }) ?? [];
            }
        });
    }
}
