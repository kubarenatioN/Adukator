import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs';
import { NetworkRequestKey } from '../helpers/network.helper';
import { Training } from '../typings/training.types';
import { TrainingDataService } from './training-data.service';

@Injectable({
	providedIn: 'root',
})
export class TrainingService {
	constructor(private trainingData: TrainingDataService) {
		
	}

    // public getTeacherTrainings(authorId: string) {
    //     return this.trainingData.getTrainings(
    //         { authorId }
    //     )
    // }

    // public getTraining(trainingId: string) {
    //     return this.trainingData.getTrainings(
    //         { trainingsIds: [trainingId] }
    //     )
    // }

    // public hasTrainingAccess(studentId: string, profileId: string) {
    //     // return this.trainingData.lookupEnrollment()
    //     return of(true)
    // }
}
