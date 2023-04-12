import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, shareReplay, switchMap } from 'rxjs';
import { TrainingDataService } from '../modules/student/services/training-data.service';
import { TrainingProfile } from '../typings/training.types';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class TrainingProgressService {
    private profileStore$ = new ReplaySubject<TrainingProfile>(1)

    public profile$ = this.profileStore$.pipe(shareReplay(1))

	constructor(
        private userService: UserService,
        private trainingData: TrainingDataService
    ) {}

	public getTrainingProfile(trainingId: string) {
		this.userService.user$.pipe(
			switchMap((user) => {
				return this.trainingData.getProfile(trainingId, user._id);
			})
		).subscribe(profile => {
            this.profileStore$.next(profile)
        });
	}
}
