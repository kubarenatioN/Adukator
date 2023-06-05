import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import {
	NetworkHelper,
	NetworkRequestKey,
} from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import {
	Personalization,
	PersonalizationAssignment,
	PersonalizationOpening,
	PersonalTask,
	ProfileProgress,
	ProfileProgressRecord,
	ProfileQuizRecord,
	TopicDiscussionReply,
	Training,
	TrainingMembershipSearchParams,
	TrainingProfileLookup,
	TrainingProfileTraining,
	TrainingProfileUser,
	TrainingReply,
} from 'src/app/typings/training.types';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { TopicTask } from '../typings/course.types';
import { DATA_ENDPOINTS } from '../constants/network.constants';
import { UserTrainingResults } from '../typings/user.types';

@Injectable({
	providedIn: 'root',
})
export class TrainingDataService {
	constructor(private dataService: DataService) {}

	public getTrainings(options: {
		trainingsIds?: string[];
		authorId?: string;
		fields?: string[];
		query?: { include?: string[] };
	}) {
		const key = NetworkRequestKey.SelectTrainings;
		const { query } = options;
		const paramsObj: {
			[key: string]: string | string[] | number | number[];
		} = {
			reqId: key,
		};
		if (query?.include) {
			paramsObj['include'] = query.include;
		}

		const payload = NetworkHelper.createRequestPayload(key, {
			body: options,
			params: paramsObj,
		});

		return this.dataService
			.send<{ data: Training[] }>(payload)
			.pipe(map((response) => response.data));
	}

	public getTrainingsList(options?: {
		pagination?: {
			offset: number;
			limit: number;
		};
		filters?: {};
		fields?: string[];
	}) {
		const key = NetworkRequestKey.TrainingList;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: options,
			params: { reqId: key },
		});

		return this.dataService
			.send<{ data: Training[] }>(payload)
			.pipe(map((response) => response.data));
	}

	public getProfile(
		body: { trainingId?: string; studentId?: string; uuid?: string },
		options?: { include?: string[] }
	) {
		const key = NetworkRequestKey.TrainingProfile;
		const payload = NetworkHelper.createRequestPayload(key, {
			body,
			params: { reqId: key, include: options?.include?.join(',') ?? '' },
		});

		return this.dataService
			.send<{
				profile: TrainingProfileTraining | null;
				hasAccess: boolean;
				progress?: ProfileProgress[];
				personalization?: Personalization[];
			}>(payload)
			.pipe(map((response) => response));
	}

	public getPersonalization(profileId: string, type?: 'assignment' | 'open') {
		const key = NetworkRequestKey.GetPersonalization;
		const paramsObj: Record<string, string> = {
			reqId: key,
		};
		if (type) {
			paramsObj['type'] = type;
		}

		const payload = NetworkHelper.createRequestPayload(key, {
			params: paramsObj,
			urlId: profileId,
		});

		return this.dataService.send<{ personalization: Personalization[] }>(
			payload
		);
	}

	public getStudentProfiles(studentId: string, fields: string[]) {
		const key = NetworkRequestKey.StudentProfiles;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: { studentId, fields },
			params: { reqId: key },
		});

		return this.dataService.send<{
			profiles: TrainingProfileTraining[] | null;
		}>(payload);
	}

	public getTrainingProfiles(
		trainingId: string,
		options?: { include?: string[] }
	) {
		const key = NetworkRequestKey.TrainingProfiles;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: { trainingId, fields: CoursesSelectFields.Short },
			params: { reqId: key, ...options },
		});

		return this.dataService.send<{
			profiles: TrainingProfileUser[] | null;
		}>(payload);
	}

	public getProfileProgress(profileId: string) {
		return this.dataService.http.get<{ progress: ProfileProgress[] }>(`${DATA_ENDPOINTS.api.training.progress}/profile/${profileId}`)
			.pipe(map(res => res.progress))
	}

	public getUserTrainingResults(userId: string) {
		return this.dataService.http.get<{ progress: ProfileProgress[] }>(`${DATA_ENDPOINTS.user}/results/${userId}`)
			.pipe(map(res => res.progress))
	}

	public getMembers(query: TrainingMembershipSearchParams) {
		const key = NetworkRequestKey.TrainingMembers;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: { ...query },
			params: { reqId: key },
		});

		return this.dataService
			.send<{ data: TrainingProfileUser[] }>(payload)
			.pipe(map((res) => res.data));
	}

	public sendTrainingReply(reply: TrainingReply) {
		const key = NetworkRequestKey.TrainingReply;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: { reply },
		});

		return this.dataService.send<{ data: unknown }>(payload);
	}

	public changeTrainingEnrollment(
		studentsIds: string[],
		trainingId: string,
		key: string
	) {
		const payload = NetworkHelper.createRequestPayload(key, {
			body: {
				studentsIds,
				trainingId,
			},
			params: { reqId: key },
		});

		return this.dataService.send(payload);
	}

	public lookupEnrollment(studentsIds: string[], trainingId: string) {
		const key = NetworkRequestKey.TrainingMembershipLookup;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: {
				studentsIds,
				trainingId,
				populate: [],
			},
			params: { reqId: key },
		});

		return this.dataService
			.send<{ data: TrainingProfileLookup[] }>(payload)
			.pipe(map((res) => res.data));
	}

	public loadTopicDiscussion(body: { profileId: string; topicId: string }) {
		const key = NetworkRequestKey.TrainingTopicDiscussion;
		const payload = NetworkHelper.createRequestPayload(key, {
			body,
			params: { reqId: key },
		});
		return this.dataService.send<{
			discussion: TopicDiscussionReply[] | null;
		}>(payload);
	}

	public loadProfileProgress(body: { profileId: string; topicId: string }) {
		const key = NetworkRequestKey.TrainingProfileProgress;
		const payload = NetworkHelper.createRequestPayload(key, {
			body,
			params: { reqId: key },
		});
		return this.dataService.send<{ progress: ProfileProgress | null }>(
			payload
		);
	}

	public updateProgress(body: {
		progressId: string;
		records: ProfileProgressRecord[];
		quiz?: ProfileQuizRecord,
	}) {
		const key = NetworkRequestKey.UpdateTrainingProfileProgress;
		const payload = NetworkHelper.createRequestPayload(key, {
			body,
			params: { reqId: key },
		});
		return this.dataService.send<{ added?: ProfileProgress }>(payload);
	}

	public createTask(
		training: string,
		topicId: string,
		authorId: string,
		task: TopicTask
	) {
		const key = NetworkRequestKey.CreateTask;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: { trainingId: training, topicId, authorId, task },
			params: { reqId: key },
		});

		return this.dataService.send(payload);
	}

	public getPersonalTasks(params: {
		authorId?: string;
		topicId?: string;
		trainingId?: string;
	}) {
		const key = NetworkRequestKey.GetPersonalTasks;
		const payload = NetworkHelper.createRequestPayload(key, {
			params: { reqId: key, ...params },
		});

		return this.dataService.send<{ tasks: PersonalTask[] }>(payload);
	}

	public assignPersonalTasks(body: {
		assign: PersonalizationAssignment[];
		unassign: PersonalizationAssignment[];
	}) {
		const key = NetworkRequestKey.Personalization;
		const payload = NetworkHelper.createRequestPayload(key, {
			body,
			params: { reqId: key, type: 'assignment' },
		});

		return this.dataService.send(payload);
	}

	public openTasks(body: {
		open: PersonalizationOpening[];
		close: PersonalizationOpening[];
	}) {
		const key = NetworkRequestKey.Personalization;
		const payload = NetworkHelper.createRequestPayload(key, {
			body,
			params: { reqId: key, type: 'opening' },
		});

		return this.dataService.send(payload);
	}

	public startTraining(body: { uuid: string; date: string }) {
		const key = NetworkRequestKey.TrainingStart;
		const payload = NetworkHelper.createRequestPayload(key, {
			body: { startAt: body.date },
			urlId: body.uuid,
		});

		return this.dataService.send<{ training: Training }>(payload);
	}

	public completeTraining(trainingId: string) {
		const key = NetworkRequestKey.TrainingComplete;
		const payload = NetworkHelper.createRequestPayload(key, {
			urlId: trainingId,
		});

		return this.dataService.send(payload);
	}
}
