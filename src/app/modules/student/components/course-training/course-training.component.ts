import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, shareReplay, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import { StudentTraining } from 'src/app/models/course.model';
import { StudentTrainingService } from 'src/app/modules/student/services/student-training.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseModule, ModuleTopic } from 'src/app/typings/course.types';
import { Training, TrainingAccess, TrainingProfile, TrainingProfileFull, TrainingProfileTraining, TrainingProfileUser, TrainingReply, TrainingReplyMessage } from 'src/app/typings/training.types';

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
    public profile$: Observable<TrainingProfileFull> = this.trainingService.profile$;
    public training$: Observable<StudentTraining> = this.profile$.pipe(
        map(profile => new StudentTraining(profile.training)),
    );
    
	constructor(
        private userService: UserService,
        private trainingService: StudentTrainingService,
        private activatedRoute: ActivatedRoute,
        private uploadService: UploadService,
    ) {
        super();
    }

	public ngOnInit(): void {
        this.activatedRoute.data.pipe(
            switchMap((resolved) => {
                const { trainingAccess } = resolved as { trainingAccess: TrainingAccess }
                if (trainingAccess) {
                    const { hasAccess, profile } = trainingAccess
                    if (hasAccess && profile != null) {
                        this.trainingService.getProfile({ trainingId: profile.training, studentId: profile.student })
                    }
                }
                return of(null)
            }),
        ).subscribe()
    
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
        const upload$ = this.profile$.pipe(
            switchMap(profile => {
                return this.uploadService.moveFilesToRemote({
                    fromFolder: `training/${profile.uuid}`,
                })
            }),
            tap(() => console.log('Uploaded training files')),
            shareReplay(1),
        )

        upload$.pipe(
            withLatestFrom(this.profile$, this.userService.user$),
            switchMap(([_, profile, user]) => {
                const reply: TrainingReply = {
                    topicId,
                    message,
                    profile: profile._id,
                    sender: user._id,
                }

                return this.trainingService.sendTrainingReply(reply);
            })
        ).subscribe(() => console.log('Training reply was uploaded!'))
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
