import { Injectable } from '@angular/core';
import {
	distinctUntilChanged,
	filter,
	map,
	ReplaySubject,
	shareReplay,
	switchMap,
	tap,
} from 'rxjs';
import {
	TrainingData,
	TrainingProfileFull,
	TrainingProfileTraining,
	TrainingReply,
} from 'src/app/typings/training.types';
import { TrainingDataService } from '../../../services/training-data.service';

@Injectable()
export class StudentTrainingService {
	private trainingDataStore$ = new ReplaySubject<TrainingData>(1);

	public trainingData$ = this.trainingDataStore$.asObservable();
	public profile$ = this.trainingData$.pipe(
		map((trainingData) => trainingData.profile),
		filter(Boolean),
		shareReplay(1)
	);
	public personalization$ = this.trainingData$.pipe(
		map((trainingData) => trainingData.personalization),
		shareReplay(1)
	);
	public progress$ = this.trainingData$.pipe(
		map((trainingData) => trainingData.progress),
		shareReplay(1)
	);

	public set trainingData(profile: TrainingData) {
		if (profile) {
			this.trainingDataStore$.next(profile);
		}
	}

	constructor(private trainingDataService: TrainingDataService) {}

	public sendTrainingReply(reply: TrainingReply) {
		return this.trainingDataService.sendTrainingReply(reply);
	}

	public getProfile(uuid: string, options?: { include?: string[] }) {
		return this.trainingDataService.getProfile({ uuid }, options);
	}
}
