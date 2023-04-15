import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentTraining } from 'src/app/models/course.model';
import { UploadService } from 'src/app/services/upload.service';
import { ModuleTopic, TopicTask } from 'src/app/typings/course.types';
import { TopicDiscussionReply, Training, TrainingProfile } from 'src/app/typings/training.types';
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
    private pickedProfileId?: string

    public checkForm!: FormGroup;

    public viewData$!: Observable<ViewData>;

    public checkTasks$!: Observable<{
        task: TopicTask
        thread: {
            type: string,
            message: string,
            date: string,
            sender: string
        }[] | null,
        folder: string,
    }[]>;

	constructor(
        private teacherTraining: TeacherTrainingService,
        private activatedRoute: ActivatedRoute,
        private uploadService: UploadService,
        private fb: FormBuilder,
    ) {
		super();
	}

	public ngOnInit(): void {
        this.activatedRoute.params.subscribe(params => {
            const trainingId = params['id']
            this.pickedProfileId = params['profileId']
            this.viewData$ = this.setupViewData(trainingId)    
        })

        this.checkForm = this.fb.group({
            profile: '',
            topic: '',
        })

        this.checkTasks$ = this.checkForm.valueChanges.pipe(
            switchMap(model => {
                console.log(model);
                const { profile, topic } = model
                if (profile && topic) {
                    return this.loadStudentTopicAnswers(profile, topic)
                }
                return of(null)
            }),
            filter(Boolean),
            withLatestFrom(this.viewData$),
            map(
                ([{ discussion }, { training, members }]: [
                    { discussion: TopicDiscussionReply[] | null }, 
                    ViewData
                ]) => {

                const { topic: topicId, profile: profileId } = this.checkForm.value
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
            })
        )
    }

    private loadStudentTopicAnswers(profileId: string, topicId: string) {
        return this.teacherTraining.loadStudentDiscussion({
            profileId,
            topicId,
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
            .filter(d => d.message.type === 'task' && d.message.taskId === task.id)
            .map(reply => ({
                type: reply.message.type,
                message: reply.message.data.comment ?? '',
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
