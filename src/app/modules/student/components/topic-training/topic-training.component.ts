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
import {
	BehaviorSubject,
	combineLatest,
	delay,
	distinctUntilChanged,
	map,
	takeUntil,
} from 'rxjs';
import { CourseTrainingService } from 'src/app/modules/student/services/course-training.service';
import { TrainingProgressService } from 'src/app/services/training-progress.service';
import { UploadService } from 'src/app/services/upload.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { ModuleTopic } from 'src/app/typings/course.types';
import { TrainingReply, TrainingReplyMessage, TrainingTaskAnswer } from 'src/app/typings/training.types';

@Component({
	selector: 'app-topic-training',
	templateUrl: './topic-training.component.html',
	styleUrls: ['./topic-training.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTrainingComponent
	extends BaseComponent
	implements OnInit, OnChanges
{
	private topicStore$ = new BehaviorSubject<ModuleTopic>({} as ModuleTopic);

	@Input() public topic!: ModuleTopic;

    @Output() public sendReply = new EventEmitter()

	public courseMaterialsFolder: string = '';

	public get controlId(): string {
		return this.topic.id;
	}

	public get isActual() {
		return this.topic.isActual;
	}

	public get isPast() {
		return this.topic.isPast;
	}

	constructor(
		private trainingService: CourseTrainingService,
		private uploadService: UploadService,
        private cdRef: ChangeDetectorRef
	) {
		super();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		const { topic } = changes;
		if (topic && topic.currentValue !== topic.previousValue) {
			this.topicStore$.next(topic.currentValue);
		}
	}

	ngOnInit(): void {
		combineLatest([
			this.topicStore$.asObservable(),
			this.trainingService.training$,
		])
			.pipe(
				takeUntil(this.componentLifecycle$),
				map(([topic, training]) => {
					return this.uploadService.getFilesFolder(
						'course',
                        training.course.uuid,
						'topics',
						topic.id
					);
				}),
                delay(2000),
				distinctUntilChanged()
			)
			.subscribe((folder) => {
                this.courseMaterialsFolder = folder;
                this.cdRef.detectChanges()
			});
	}

	public onSendTask(message: TrainingReplyMessage): void {
        this.sendReply.emit({
            message,
            topicId: this.topic.id
        });
	}
}
