import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { generateUUID } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { StudentTraining } from 'src/app/models/course.model';
import { UploadService } from 'src/app/services/upload.service';
import { TopicTask } from 'src/app/typings/course.types';
import { ProfileProgress, ProfileProgressRecord, TaskCheckThread, TopicDiscussionReply, TrainingProfile, TrainingReply, TrainingTaskAnswer } from 'src/app/typings/training.types';
import { User } from 'src/app/typings/user.types';
import { TeacherTrainingService } from '../../services/teacher-training.service';


type ViewData = {
    training: StudentTraining,
    members: TrainingProfile<string, User>[]
}

@Component({
	selector: 'app-training-check',
	templateUrl: './training-check.component.html',
	styleUrls: ['./training-check.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingCheckComponent
	extends CenteredContainerDirective
	implements OnInit
{
    private resultsForm!: FormArray<FormGroup>
    private activeProfileProgressId?: string
   
    public resultsFormMap: Record<string, FormGroup> = {}
    
    public checkConfigForm;

    public viewData$!: Observable<ViewData>;
    public checkTasks$!: Observable<TaskCheckThread[] | null>;
    public topicCheckData$!: Observable<{ 
        discussion: TopicDiscussionReply[] | null,
        progress: ProfileProgress | null
    } | null>;

	constructor(
        private teacherTraining: TeacherTrainingService,
        private activatedRoute: ActivatedRoute,
        private uploadService: UploadService,
        private fbHelper: FormBuilderHelper,
    ) {
		super();

        this.checkConfigForm = this.fbHelper.fbRef.group({
            profile: '',
            topic: '',
        })
	}

	public ngOnInit(): void {
        this.activatedRoute.params.subscribe(params => {
            const trainingId = params['id']
            this.viewData$ = this.setupViewData(trainingId)    
        })

        this.topicCheckData$ = this.checkConfigForm.valueChanges.pipe(
            switchMap(model => {
                const { profile, topic } = model

                if (profile && topic) {
                    return this.loadTopicCheckData(profile, topic)
                }
                return of(null)
            }),
            shareReplay(1)
        )

        this.checkTasks$ = this.topicCheckData$.pipe(
            filter(Boolean),
            withLatestFrom(this.viewData$),
            tap(([checkData, viewData]) => {
                const { training } = viewData
                const { progress } = checkData
                this.activeProfileProgressId = progress?._id
                this.initResultsForm(training, progress)
            }),
            map(
                ([checkData, viewData]: [
                    { 
                        discussion: TopicDiscussionReply[] | null,
                        progress: ProfileProgress | null
                    },
                    ViewData
                ]) => {

                const { discussion, progress } = checkData
                if (!discussion || !progress) {
                    return null;
                }

                const { training, members } = viewData

                const { topic: topicId, profile: profileId } = this.checkConfigForm.value
                const topic = training.topics.find(topic => topic.id === topicId)
                const tasks = topic?.practice?.tasks
                const profileUUId = members.find(member => member._id === profileId)?.uuid ?? ''

                const tasksForCheck = tasks?.map(task => {
                    return this.prepareTaskThreadData(
                        task, 
                        profileUUId, 
                        discussion
                    )
                })
                
                return tasksForCheck ?? []
            }),
            shareReplay(1)
        )
    }

    public onSaveCheckResults(e: Event) {
        const date = new Date().toUTCString()

        this.checkTasks$.pipe(
            switchMap((tasksCheck) => {
                const results = this.resultsForm.value
                if (!tasksCheck || !this.activeProfileProgressId) {
                    return of(null)
                }
                const resultsRecords: ProfileProgressRecord[] = tasksCheck.map((taskCheck, i) => {
                    const task = taskCheck.task
                    return {
                        uuid: generateUUID(),
                        taskId: task.id,
                        mark: results[i].mark,
                        isCounted: results[i].isCounted,
                        comment: results[i].comment,
                        date
                    }
                })

                return this.teacherTraining.saveProfileProgress(this.activeProfileProgressId, resultsRecords)
            }),
            take(1)
        ).subscribe()
    }

    public tasksResultsTrackBy(index: number, taskCheck: TaskCheckThread) {
        return taskCheck.task.id
    }

    private initResultsForm(training: StudentTraining, progress: ProfileProgress | null) {
        const { topic: topicId } = this.checkConfigForm.value ?? ''
        const topicTasks = training.topics.find(topic => topic.id === topicId)?.practice?.tasks ?? []
        this.resultsFormMap = {};
        if (progress) {
            const formArray = this.getResultsFormArray(topicTasks, progress)
            this.resultsForm = new FormArray(formArray)
        }
    }

    private getResultsFormArray(tasks: TopicTask[], profile: ProfileProgress) {        
        const tasksLastResults = tasks.map(task => {
            const lastResult = profile.records
            .filter(record => record.taskId === task.id)
            .sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            })[0]

            const form = this.fbHelper.getTaskResultsCheckForm(lastResult ?? null)

            this.resultsFormMap[task.id] = form
            
            return form
        })

        return tasksLastResults
    }

    private loadTopicCheckData(profileId: string, topicId: string) {
        return forkJoin({
            discussion: this.teacherTraining.loadDiscussion({
                profileId,
                topicId,
            }),
            progress: this.teacherTraining.loadProgress({
                profileId,
                topicId,
            })
        })
    }

    private setupViewData(trainingId: string) {
        const training$ = this.getTraining(trainingId).pipe(
            filter(Boolean)
        )
        return training$.pipe(
            switchMap(training => {
                if (training) {
                    return this.getStudentsProfiles(training._id)    
                }
                return of([])
            }),
            withLatestFrom(training$),
            map(([members, training]) => ({
                training: new StudentTraining(training),
                members,
            })),
            shareReplay(1)
        )
    }

    private getStudentsProfiles(trainingId: string) {
        return this.teacherTraining.getStudentsProfiles(trainingId)
    }

    private getTraining(trainingId: string) {
        return this.teacherTraining.getCheckTraining(trainingId).pipe(
            shareReplay(1)
        );
    }

    private prepareTaskThreadData(task: TopicTask, profileId: string, discussion: TopicDiscussionReply[] | null) {
        if (discussion === null || discussion.length === 0 || !profileId) {
            return {
                task,
                thread: null,
                folder: ''
            }
        }

        const thread = discussion
            .filter(reply => reply.type === 'task' && reply.taskId === task.id)
            .map(reply => ({
                type: reply.type,
                message: (reply.message as TrainingTaskAnswer).comment,
                date: reply.date,
                sender: reply.sender,
            }))

        return {
            task,
            thread,
            folder: this.uploadService.getFilesFolder('training', profileId, task.id)
        }
    }
}
