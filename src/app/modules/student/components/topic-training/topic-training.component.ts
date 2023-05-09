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
import { addDays } from 'date-fns/esm';
import {
	BehaviorSubject,
	combineLatest,
	distinctUntilChanged,
	map,
	takeUntil,
	tap,
} from 'rxjs';
import { StudentTraining } from 'src/app/models/course.model';
import { StudentTrainingService } from 'src/app/modules/student/services/student-training.service';
import { UploadService } from 'src/app/services/upload.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { ModuleTopic, TopicTask } from 'src/app/typings/course.types';
import {
	TrainingReply,
	TrainingReplyMessage,
} from 'src/app/typings/training.types';

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

	@Input() public profileId!: string;
	@Input() public topic!: ModuleTopic;
	@Input() public training!: StudentTraining;

	@Output() public sendReply = new EventEmitter<
		Pick<TrainingReply, 'message' | 'type' | 'topicId'>
	>();

	public trainingMaterialsFolder: string = '';

	public personalTasks$ = this.trainingService.personalization$.pipe(
		map((personalization) => {
			let tasks: TopicTask[] | null = null;
			if (personalization) {
				tasks = personalization
					.filter((pers) => pers.type === 'assignment')
					.map((pers) => pers.task!.task);
			}
			return tasks;
		})
	);

	public get controlId(): string {
		return this.topic.id;
	}

	public get isActual() {
		return this.topic.isActual;
	}

	public get isPast() {
		return this.topic.isPast;
	}

	public get status() {
		return this.training.status;
	}

	public get deadline() {
		return addDays(new Date(this.topic.startAt), this.topic.duration);
	}

	constructor(
		private trainingService: StudentTrainingService,
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
			this.trainingService.profile$,
		])
			.pipe(
				takeUntil(this.componentLifecycle$),
				map(([topic, profile]) => {
					return this.uploadService.getFilesFolder(
						'course',
						profile.training.course.uuid,
						'topics',
						topic.id
					);
				}),
				distinctUntilChanged()
			)
			.subscribe((folder) => {
				this.trainingMaterialsFolder = folder;
				this.cdRef.detectChanges();
			});
	}

	public onSendTask(message: TrainingReplyMessage): void {
		this.sendReply.emit({
			topicId: this.topic.id,
			type: 'task',
			message,
		});
	}

	public copyProfileIdToClipboard(textElem: HTMLElement) {
		const text = textElem.innerText;
		navigator.clipboard.writeText(text);
	}

	public tasksTrackBy = (index: number, task: TopicTask): string => {
		const id = `${this.profileId}-${this.topic.id}-${task.id}`;

		return id;
	};
}
