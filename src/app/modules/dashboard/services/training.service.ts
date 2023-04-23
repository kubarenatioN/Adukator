import { Injectable } from '@angular/core';
import { ReplaySubject, switchMap } from 'rxjs';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UserService } from 'src/app/services/user.service';
import { TrainingProfileTraining } from 'src/app/typings/training.types';

@Injectable()
export class TrainingService {
    private studentProfilesStore$ = new ReplaySubject<TrainingProfileTraining[]>(1)

    public studentProfiles$ = this.studentProfilesStore$.asObservable()

	constructor(private userService: UserService, private trainingDataService: TrainingDataService) {
        this.getStudentProfiles()
    }

	private getStudentProfiles() {
        this.userService.user$.pipe(
            switchMap(user => {
                return this.trainingDataService.getStudentProfiles(user._id)
            })
        ).subscribe(res => {
            this.studentProfilesStore$.next(res.profiles ?? [])
        })
	}
}
