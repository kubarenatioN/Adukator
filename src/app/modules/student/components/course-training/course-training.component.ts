import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, shareReplay, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import { StudentTraining } from 'src/app/models/course.model';
import { CourseTrainingService } from 'src/app/modules/student/services/course-training.service';
import { CoursesService } from 'src/app/services/courses.service';
import { TrainingProgressService } from 'src/app/services/training-progress.service';
import { UserService } from 'src/app/services/user.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseModule, ModuleTopic } from 'src/app/typings/course.types';
import { TrainingReply, TrainingReplyMessage, TrainingTaskAnswer } from 'src/app/typings/training.types';

enum ViewType {
    Main = 'main',
    Module = 'module',
    Topic = 'topic',
}

interface ViewConfig {
    viewType: ViewType,
    training: StudentTraining,
    module?: CourseModule,
    topic?: ModuleTopic
}

@Component({
	selector: 'app-course-training',
	templateUrl: './course-training.component.html',
	styleUrls: ['./course-training.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseTrainingComponent extends BaseComponent implements OnInit {
    private viewTypeStore$ = new BehaviorSubject<ViewType>(ViewType.Main)

    public viewType$: Observable<string> = this.viewTypeStore$.asObservable();
    public viewData$!: Observable<ViewConfig>

    public viewTypes = ViewType;
    public training$ = this.trainingService.training$;
    public profile$ = this.trainingProgressService.profile$;
    
	constructor(
        private userService: UserService,
        private trainingProgressService: TrainingProgressService,
        private trainingService: CourseTrainingService,
        private activatedRoute: ActivatedRoute) {
        super();
    }

	public ngOnInit(): void {
        this.activatedRoute.paramMap
            .pipe(
                take(1),
                map(params => {
                    const trainingId = String(params.get('id'));
                    return trainingId
                }),
            )
            .subscribe((trainingId) => {
                this.trainingService.getCourseTraining(trainingId);
            })

        this.training$.subscribe(training => {
            this.trainingProgressService.getTrainingProfile(training._id);
        })
    
        this.viewData$ = combineLatest([
            this.activatedRoute.queryParams,
            this.training$.pipe(filter(Boolean)),
        ])
        .pipe(
            takeUntil(this.componentLifecycle$),
            map(([params, training]: [{module?: string, topic?: string}, StudentTraining]) => {
                const { module: moduleId, topic: topicId } = params;
                const viewType = this.getViewType(moduleId, topicId)
                if (viewType === this.viewTypes.Module && moduleId) {
                    return {
                        viewType,
                        training,
                        module: training.getModule(moduleId),
                    }
                }
                if (viewType === this.viewTypes.Topic && topicId) {
                    const topic = training.getTopic(topicId);
                    return {
                        viewType,
                        training,
                        module: training.getTopicModule(topicId),
                        topic: topic,
                    }
                }

                return { viewType, training }
            })
        )
    }

    public onSendReply({ message, topicId } : {message: TrainingReplyMessage, topicId: string }) {
        this.profile$.pipe(
            withLatestFrom(this.userService.user$),
            switchMap(([profile, user]) => {
                console.log(profile);

                const reply: TrainingReply = {
                    topicId,
                    message,
                    profile: profile._id,
                    sender: user._id,
                }
                console.log(reply);

                return this.trainingService.sendTrainingReply(reply);
            })
        ).subscribe(response => {
            console.log('send', response);
        })
    }

    private getViewType(moduleId?: string, topicId?: string): ViewType {
        if (!moduleId && !topicId) {
            return ViewType.Main
        }
        if (moduleId) {
            return ViewType.Module
        }
        if (topicId) {
            return ViewType.Topic
        }
        return ViewType.Main
    }
}
