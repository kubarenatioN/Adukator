import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { UploadHelper } from 'src/app/helpers/upload.helper';
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

    public materialsFolder!: string

	constructor() {}

	ngOnInit(): void {

    }
}
