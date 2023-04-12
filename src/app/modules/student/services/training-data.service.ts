import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import { DataResponse } from 'src/app/typings/response.types';
import { Training, TrainingProfile, TrainingReply } from 'src/app/typings/training.types';

@Injectable({
    providedIn: 'root'
})
export class TrainingDataService {
	constructor(private dataService: DataService) {}
	
    public getProfile(trainingId: string, studentId: string): Observable<TrainingProfile> {
        const key = NetworkRequestKey.TrainingProgress
        const payload = NetworkHelper.createRequestPayload(key, {
            body: { trainingId, studentId }
        })
        
        return this.dataService.send<{ profile: TrainingProfile }>(payload).pipe(
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
}
