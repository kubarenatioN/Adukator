import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, shareReplay } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { Training } from 'src/app/typings/training.types';

@Injectable({
	providedIn: 'root',
})
export class LearnService {
	// private trainingStore$ = new ReplaySubject<Training>(1);
    private trainingsListStore$ = new BehaviorSubject<Training[]>([]);

	public trainingsList$: Observable<Training[]> = this.trainingsListStore$.asObservable().pipe(
        shareReplay(1)
    );
	// public training$ = this.trainingStore$.pipe(shareReplay(1));

	constructor(private trainingDataService: TrainingDataService) {
        this.loadList({
            pagination: {
                offset: 0,
                limit: 10,
            },
            fields: CoursesSelectFields.Short
        })
    }

    public loadList(options: {
        pagination?: {
            offset: number,
            limit: number
        },
        filters?: {},
        fields: string[]
    }) {
        this.trainingDataService.getTrainingsList(options)
        .subscribe(trainings => this.trainingsListStore$.next(trainings));
    }

    public getTraining(trainingId: string) {
        return this.trainingDataService.getTrainings({
            trainingsIds: [trainingId]
        })
    }

    public lookupTraining(studentsIds: string[], trainingId: string) {
        return this.trainingDataService.lookupEnrollment(studentsIds, trainingId)
    }

    // public getTrainingProfile(uuid: string) {
    //     return this.trainingDataService.getProfile({ uuid })
    // }

    public changeProfileEnrollment(
		studentsIds: string[],
		trainingId: string,
        key: string
	) {
        return this.trainingDataService.changeTrainingEnrollment(studentsIds, trainingId, key)
	}
}