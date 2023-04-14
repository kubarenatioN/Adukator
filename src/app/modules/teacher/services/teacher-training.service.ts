import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import {
	Training,
	TrainingMembershipSearchParams,
	TrainingMembershipStatus as EnrollStatus,
} from '../../../typings/training.types';
import { UserService } from '../../../services/user.service';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';

@Injectable({
	providedIn: 'root',
})
export class TeacherTrainingService {
	private trainingsStore$ = new ReplaySubject<Training[]>(1);
	private topicDiscussionStore$ = new ReplaySubject<unknown>(1);

	public trainings$ = this.trainingsStore$
		.asObservable()
		.pipe(shareReplay(1));

    public topicDiscussion$ = this.topicDiscussionStore$.asObservable()

	constructor(
		private userService: UserService,
		private trainingDataService: TrainingDataService
	) {
		this.initTeacherTrainings();
	}

    public loadStudentDiscussion(payload: { profileId: string, topicId: string }) {
        return this.trainingDataService.loadTopicDiscussion(payload)
        // this.trainingDataService.loadTopicDiscussion(payload)
        // .subscribe(discussion => {
        //     this.topicDiscussionStore$.next(discussion)
        // })
    }

	public getStudentsProfiles(trainingId: string) {
		const size = -1;
		return this.trainingDataService.getMembers({
			type: 'list',
			trainingId,
			enrollment: EnrollStatus.Approved,
			populate: ['student'],
			size,
		});
	}

	// Get bulk list of training members
	public getEnrollmentList(
		trainingId: string,
		enrollment: EnrollStatus,
		options: { page: number }
	) {
		const size = 10;
		const searchParams: TrainingMembershipSearchParams = {
			type: 'list',
			trainingId,
			enrollment,
			populate: ['student'],
			page: options.page,
			size,
		};

		return this.trainingDataService.getMembers(searchParams);
	}

	public getCheckTraining(trainingId: string) {
		return this.trainingDataService
			.getTrainings({
				trainingsIds: [trainingId],
				fields: CoursesSelectFields.Full,
			})
			.pipe(map((trainings) => trainings[0]));
	}

	private initTeacherTrainings() {
		this.userService.user$
			.pipe(
				switchMap((user) => {
					return this.getTrainings(
						user.uuid,
						CoursesSelectFields.Short
					);
				})
			)
			.subscribe((data) => {
				this.trainingsStore$.next(data);
			});
	}

	private getTrainings(authorId: string, fields?: string[]) {
		return this.trainingDataService.getTrainings({ authorId, fields });
	}
}

// private createTopicDiscussionMap(replies: TopicDiscussionReply[], topics: ModuleTopic[]) {
//     return replies.reduce((arr, curr) => {
//         const taskId = curr.message.taskId
//         if (taskId) {
//             const existedTask = arr.find(it => it.task.id === taskId)
//             if (existedTask) {
//                 existedTask.replies.push(curr)
//             } else {
//                 const topic = topics.find(topic => topic.id === curr.topicId)
//                 const task = topic?.practice?.tasks.find(task => task.id === taskId)!

//                 const taskItem = {
//                     task,
//                     replies: [curr]
//                 }
//                 arr.push(taskItem)
//             }
//         }
//         return arr
//     }, [] as TaskDiscussion[])
// }