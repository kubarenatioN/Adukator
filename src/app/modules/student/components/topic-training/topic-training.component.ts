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
	ProfileProgress,
	TrainingProfileTraining,
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
	private personalTasks: TopicTask[] = []

	@Input() public profileId!: string;
	@Input() public topic!: ModuleTopic;
	@Input() public training!: StudentTraining;
	
	@Output() public sendReply = new EventEmitter<
		Pick<TrainingReply, 'message' | 'type' | 'topicId'>
	>();

	public trainingMaterialsFolder: string = '';
	public profile!: TrainingProfileTraining;
	public progress!: ProfileProgress[];
	
	public personalTasks$ = 
		combineLatest([
			this.topicStore$,
			this.trainingService.personalization$,
		])
		.pipe(
			map(([topicStore, personalization]) => {
				let tasks: TopicTask[] | null = null;
				if (personalization) {		
					tasks = personalization
						.filter((pers) => pers.type === 'assignment' && pers.task?.topicId === this.topic.id)
						.map((pers) => pers.task!.task);
					this.personalTasks = tasks;
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
		return addDays(new Date(this.topic.startAt), this.topic.duration ?? 0);
	}

	public get maxScore() {
		const baseTasks = this.topic.practice?.tasks.length ?? 0
		const personalTasks = this.personalTasks.length ?? 0
		return (baseTasks + personalTasks) * 100
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
			this.cdRef.detectChanges()
		}
	}

	ngOnInit(): void {
		combineLatest([
			this.topicStore$.asObservable(),
			this.trainingService.profile$,
			this.trainingService.progress$,
		])
			.pipe(
				takeUntil(this.componentLifecycle$),
				map(([topic, profile, progress]) => {
					this.profile = profile;
					this.progress = progress ?? [];

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

	public tasksTrackBy = (index: number, task: any): string => {
		if (task.type === 'personal') {
			return task.id
		}

		const id = `${this.profileId}-${task.id}`;

		return id;
	};

	public getProgress() {
		if (this.progress) {
			return this.progress.find(p => p.topicId === this.topic.id)
		}
		return null;
	}
}
