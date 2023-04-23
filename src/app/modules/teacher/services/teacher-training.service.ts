import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import {
    ProfileProgressRecord,
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

    public getProfile(profileId: string, options?: { include?: ('progress')[] }) {
        return this.trainingDataService.getProfile({ uuid: profileId }, options)
    }

    public saveProfileProgress(progressId: string, records: ProfileProgressRecord[]) {
        return this.trainingDataService.updateProgress({
            progressId,
            records
        })
    }

    public loadDiscussion(payload: { profileId: string, topicId: string }) {
        return this.trainingDataService.loadTopicDiscussion(payload).pipe(
            map(res => res.discussion)
        )
    }

    public loadProgress(payload: { profileId: string, topicId: string }) {
        return this.trainingDataService.loadProfileProgress(payload).pipe(
            map(res => res.progress)
        )
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
