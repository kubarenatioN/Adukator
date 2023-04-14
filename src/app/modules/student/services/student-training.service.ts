import { Injectable } from '@angular/core';
import { ReplaySubject, shareReplay } from 'rxjs';
import { TrainingProfile, TrainingProfileFull, TrainingProfileTraining, TrainingProfileUser, TrainingReply } from 'src/app/typings/training.types';
import { TrainingDataService } from '../../../services/training-data.service';

@Injectable()
export class StudentTrainingService {
    private profileStore$ = new ReplaySubject<TrainingProfileFull>(1)

    public profile$ = this.profileStore$.pipe(shareReplay(1))
    
	constructor(private trainingData: TrainingDataService) {
		
	}

    public sendTrainingReply(reply: TrainingReply) {
        return this.trainingData.sendTrainingReply(reply)
    }

    public getProfile(options: { trainingId: string, studentId: string }) {
        this.trainingData.getProfile(options).subscribe(profile => {
            if (profile) {
                this.profileStore$.next(profile)
            }
        })
	}
}
