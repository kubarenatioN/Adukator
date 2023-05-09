import { Injectable } from '@angular/core';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';
import { TopicTask } from 'src/app/typings/course.types';
import {
	PersonalizationAssignment,
	PersonalizationOpening,
	Training,
} from 'src/app/typings/training.types';

@Injectable({
	providedIn: 'root',
})
export class PersonalizationService {
	constructor(
		private userService: UserService,
		private trainingDataService: TrainingDataService,
		private uploadService: UploadService
	) {}

	public getProfilePersonalization(
		profileId: string,
		type?: 'assignment' | 'open'
	) {
		return this.trainingDataService
			.getPersonalization(profileId, type)
			.pipe(map((res) => res.personalization));
	}

	public applyTasksAssignment(payload: {
		assign: PersonalizationAssignment[];
		unassign: PersonalizationAssignment[];
	}) {
		return this.trainingDataService.assignPersonalTasks(payload);
	}

	public applyTasksOpening(payload: {
		open: PersonalizationOpening[];
		close: PersonalizationOpening[];
	}) {
		return this.trainingDataService.openTasks(payload);
	}

	public createTask(training: Training, topicId: string, task: TopicTask) {
		const upload$ = this.uploadService
			.moveFilesToRemote({
				fromFolder: `personalization/${training.uuid}/${task.id}`,
				toFolder: `personalization/${training.uuid}/${task.id}`,
				subject: 'personalization:task',
			})
			.pipe(shareReplay(1));

		return upload$.pipe(
			switchMap(() => this.userService.user$),
			switchMap((user) => {
				return this.trainingDataService.createTask(
					training._id,
					topicId,
					user._id,
					task
				);
			})
		);
	}

	public getTeacherTasks() {
		return this.userService.user$.pipe(
			switchMap((user) => {
				return this.trainingDataService.getPersonalTasks({
					authorId: user._id,
				});
			}),
			map((res) => {
				return res.tasks;
			})
		);
	}

	public getTasks(options: {
		authorId?: string;
		topicId?: string;
		trainingId?: string;
	}) {
		return this.trainingDataService.getPersonalTasks(options).pipe(
			map((res) => {
				return res.tasks;
			})
		);
	}
}
