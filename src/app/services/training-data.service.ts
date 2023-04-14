import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import { Training, TrainingProfile, TrainingProfileLookup, TrainingReply } from 'src/app/typings/training.types';

@Injectable({
    providedIn: 'root'
})
export class TrainingDataService {
	constructor(private dataService: DataService) {}
	
    public getTrainings(options?: {
        trainingsIds?: string[],
        authorId?: string,
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

    public getProfile(options: { trainingId: string, studentId: string }): Observable<TrainingProfile | null> {
        const key = NetworkRequestKey.TrainingProgress
        const payload = NetworkHelper.createRequestPayload(key, {
            body: options
        })
        console.log('get profile', options);
        return this.dataService.send<{ profile: TrainingProfile | null }>(payload).pipe(
            map(response => response.profile)
        )
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

    public checkTrainingAccess(body: { trainingUUId: string, userId: string }) {
        const key = NetworkRequestKey.TrainingAccess
        const payload = NetworkHelper.createRequestPayload(key, {
            body,
            params: { reqId: key }
        })
        return this.dataService.send<{ hasAccess: boolean, profile?: TrainingProfile }>(payload)
    }
}
