import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentTraining } from 'src/app/models/course.model';
import { ModuleTopic, TopicTask } from 'src/app/typings/course.types';
import { TopicDiscussionReply, Training, TrainingProfile } from 'src/app/typings/training.types';
import { User } from 'src/app/typings/user.types';
import { TeacherTrainingService } from '../../services/teacher-training.service';

type TopicDiscussionMap = {
    [key: string]: {
        task: TopicTask | null,
        replies: TopicDiscussionReply[]
    }
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

    public viewData$!: Observable<{
        training: StudentTraining,
        members: TrainingProfile<string, User>[]
    }>;

    public checkTasks$!: Observable<{
        task: TopicTask
        thread: TopicDiscussionReply[]
    }[]>;
    public topicDiscussionMap$!: Observable<TopicDiscussionMap | null>;

	constructor(
        private teacherTraining: TeacherTrainingService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
    ) {
		super();
	}

	public ngOnInit(): void {
        this.activatedRoute.params.subscribe(params => {
            const trainingId = params['id']
            this.pickedProfileId = params['studentId']
            this.viewData$ = this.setupViewData(trainingId)    
        })

        this.checkForm = this.fb.group({
            profile: this.pickedProfileId,
            topic: '',
        })
        
        this.checkForm.valueChanges.subscribe(model => {
            const { profile, topic } = model
            
        })

        // this.checkTasks$ = this.checkForm.valueChanges.pipe(
        //     withLatestFrom(this.viewData$),
        //     map(([model, viewData]) => {
        //         console.log(model);
        //         const { profile, topic: topicId } = model
        //         if (profile && topicId) {
        //             const trainingTopic = viewData.training.topics.find(topic => topic.id === topicId) ?? null
        //             if (trainingTopic === null) {
        //                 return []
        //             }
        //             return trainingTopic.practice?.tasks ?? []
        //         }
        //         return null
        //     })
        // )

        this.checkTasks$ = this.checkForm.valueChanges.pipe(
            switchMap(model => {
                console.log(model);
                const { profile, topic } = model
                if (profile && topic) {
                    return this.loadStudentTopicAnswers(profile, topic)
                }
                return of({ discussion: null })
            }),
            withLatestFrom(this.viewData$),
            map(
                ([{ discussion }, { training }]: [
                    { discussion: TopicDiscussionReply[] | null }, 
                    { training: StudentTraining }
                ]) => {

                const { topic: topicId } = this.checkForm.value
                const topic = training.topics.find(topic => topic.id === topicId)
                console.log(topic?.practice?.tasks);
                const tasksForCheck = topic?.practice?.tasks.map(task => {
                    return {
                        task,
                        thread: discussion?.filter(d => d.message.type === 'task' && d.message.taskId === task.id) ?? []
                    }
                })
                
                return tasksForCheck ?? []
            })
        )
    }

    public onProfileChanged(e: Event) {
        // console.log(e);
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
            tap(({ training }) => {
                // this.trainingTopics = training.topics
                // this.activeTopic = this.trainingTopics[0]
            }),
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

    private createTopicDiscussionMap(replies: TopicDiscussionReply[], topics: ModuleTopic[]) {
        return replies.reduce((map, curr) => {
            const taskId = curr.message.taskId
            if (taskId) {
                if (map[taskId]) {
                    const { replies } = map[taskId]
                    replies.push(curr)
                    map[taskId].replies = replies
                } else {
                    const topic = topics.find(topic => topic.id === curr.topicId)
                    const task = topic?.practice?.tasks.find(task => task.id === taskId) ?? null
                    map[taskId] = {
                        task,
                        replies: [curr]
                    }
                }
            }
            return map
        }, {} as TopicDiscussionMap)
    }
}
