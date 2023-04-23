import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import { ProfileProgress, ProfileProgressRecord, TopicDiscussionReply, Training, TrainingMembershipSearchParams, TrainingProfile, TrainingProfileFull, TrainingProfileLookup, TrainingProfileTraining, TrainingReply } from 'src/app/typings/training.types';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { CoursesSelectResponse } from '../typings/response.types';
import { User } from '../typings/user.types';

@Injectable({
    providedIn: 'root'
})
export class TrainingDataService {
	constructor(private dataService: DataService) {}
	
    public getTrainings(options?: {
        trainingsIds?: string[],
        authorId?: string,
        fields?: string[]
    }) {
        const key = NetworkRequestKey.SelectTrainings
        const payload = NetworkHelper.createRequestPayload(key, {
            body: options,
            params: { reqId: key }
        })

        return this.dataService.send<{ data: Training[] }>(payload).pipe(
            map(response => response.data)
        )
    }
	
    public getTrainingsList(options?: {
        pagination?: {
            offset: number,
            limit: number
        },
        filters?: {},
        fields?: string[]
    }) {
        const key = NetworkRequestKey.TrainingList
        const payload = NetworkHelper.createRequestPayload(key, {
            body: options,
            params: { reqId: key }
        })

        return this.dataService.send<{ data: Training[] }>(payload).pipe(
            map(response => response.data)
        )
    }

    public getProfile(
        body: { trainingId?: string, studentId?: string, uuid?: string }, 
        options?: { include?: string[] }
    ) {
        const key = NetworkRequestKey.TrainingProfile
        const payload = NetworkHelper.createRequestPayload(key, {
            body,
            params: { reqId: key, include: options?.include?.join(',') ?? '' }
        })
        
        return this.dataService.send<{ 
            profile: TrainingProfileTraining | null, 
            hasAccess: boolean,
            progress?: ProfileProgress[]
        }>(payload).pipe(
            map(response => response)
        )
    }

    public getStudentProfiles(studentId: string) {
        const key = NetworkRequestKey.StudentProfiles
        const payload = NetworkHelper.createRequestPayload(key, {
            body: { studentId, fields: CoursesSelectFields.Short },
            params: { reqId: key }
        })

        return this.dataService.send<{ profiles: TrainingProfileTraining[] | null }>(payload)
    }

    public getMembers(query: TrainingMembershipSearchParams) {
        const key = NetworkRequestKey.TrainingMembers
        const payload = NetworkHelper.createRequestPayload(key, {
            body: { ...query },
            params: { reqId: key }
        })
        
        return this.dataService.send<{ data: TrainingProfile<string, User>[] }>(payload).pipe(
            map(res => res.data)
        );
    }

    public sendTrainingReply(reply: TrainingReply) {
        const key = NetworkRequestKey.TrainingReply
        const payload = NetworkHelper.createRequestPayload(key, {
            body: { reply }
        })

        return this.dataService.send<{ data: unknown }>(payload);
    }

    public changeTrainingEnrollment(
        studentsIds: string[],
		trainingId: string,
        key: string,
    ) {
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                studentsIds,
                trainingId,
                status
            },
            params: { reqId: key }
        })
        
        return this.dataService.send(payload);
    }

    public lookupEnrollment(studentsIds: string[], trainingId: string) {
        const key = NetworkRequestKey.TrainingMembershipLookup;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                studentsIds,
                trainingId,
                populate: []
            },
            params: { reqId: key }
        })

        return this.dataService.send<{ data: TrainingProfileLookup[] }>(payload).pipe(map(res => res.data));
    }

    public loadTopicDiscussion(body: { profileId: string, topicId: string }) {
        const key = NetworkRequestKey.TrainingTopicDiscussion
        const payload = NetworkHelper.createRequestPayload(key, {
            body,
            params: { reqId: key }
        })
        return this.dataService.send<{ discussion: TopicDiscussionReply[] | null }>(payload)
    }

    public loadProfileProgress(body: { profileId: string, topicId: string }) {
        const key = NetworkRequestKey.TrainingProfileProgress
        const payload = NetworkHelper.createRequestPayload(key, {
            body,
            params: { reqId: key }
        })
        return this.dataService.send<{ progress: ProfileProgress | null }>(payload)
    }

    public updateProgress(body: { progressId: string, records: ProfileProgressRecord[] }) {
        const key = NetworkRequestKey.UpdateTrainingProfileProgress
        const payload = NetworkHelper.createRequestPayload(key, {
            body,
            params: { reqId: key }
        })
        return this.dataService.send<{ added?: ProfileProgress }>(payload)
    }
}
