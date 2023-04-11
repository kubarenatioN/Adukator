import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	OnInit,
    SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs';
import { CourseTrainingService } from 'src/app/modules/student/services/course-training.service';
import { UploadService } from 'src/app/services/upload.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { TaskAnswer } from 'src/app/typings/course-training.types';
import { ModuleTopic } from 'src/app/typings/course.types';

@Component({
	selector: 'app-topic-training',
	templateUrl: './topic-training.component.html',
	styleUrls: ['./topic-training.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTrainingComponent extends BaseComponent implements OnInit, OnChanges {
    private topicStore$ = new BehaviorSubject<ModuleTopic>({} as ModuleTopic)
    
	@Input() public topic!: ModuleTopic;

    public filesFolder!: string; 

    public get controlId(): string {
        return this.topic.id
    };

    public get isActual() {
        return this.topic.isActual
    };

    public get isPast() {
        return this.topic.isPast
    };

	constructor(private trainingService: CourseTrainingService, private uploadService: UploadService) {
        super()
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const { topic } = changes
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
                return this.uploadService.getFilesFolder(training.id, 'topics', topic.id)
            }),
            distinctUntilChanged(),
        )
        .subscribe(folder => {
            this.filesFolder = folder
        })
    }

    public onSendTask(answer: TaskAnswer) {
        console.log('111 send answer', answer.id);
    }
}
