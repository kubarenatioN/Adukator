import { Injectable } from '@angular/core';
import { distinctUntilChanged, filter, ReplaySubject, shareReplay, switchMap, tap } from 'rxjs';
import {
	TrainingProfileFull,
	TrainingProfileTraining,
	TrainingReply,
} from 'src/app/typings/training.types';
import { TrainingDataService } from '../../../services/training-data.service';

@Injectable()
export class StudentTrainingService {
	private trainingProfileStore$ = new ReplaySubject<TrainingProfileTraining>(1);

	public trainingProfile$ = this.trainingProfileStore$.asObservable()

    public set trainingProfile(profile: TrainingProfileTraining | null) {
        if (profile) {
            this.trainingProfileStore$.next(profile)
        }
    }

	constructor(private trainingData: TrainingDataService) {}

	public sendTrainingReply(reply: TrainingReply) {
		return this.trainingData.sendTrainingReply(reply);
	}

	public getProfile(uuid: string, options?: { include?: string[] }) {
		return this.trainingData.getProfile({ uuid }, options)
	}
}
