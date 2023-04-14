import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { NetworkHelper, NetworkRequestKey } from '../../../helpers/network.helper';
import { TrainingMembershipSearchParams, TrainingMembershipStatus, TrainingProfile } from '../../../typings/training.types';
import { DataService } from '../../../services/data.service';

@Injectable({
	providedIn: 'root',
})
export class TrainingManagementService {
	constructor(private dataService: DataService) {
        
    }

    public updateStudentTrainingEnrollment(
        studentsIds: string[],
		trainingId: string,
        status: TrainingMembershipStatus
    ) {
        const key = NetworkRequestKey.UpdateTrainingEnroll
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

	

}
