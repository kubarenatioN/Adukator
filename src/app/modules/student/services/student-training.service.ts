import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, ReplaySubject, shareReplay, switchMap } from 'rxjs';
import { CoursesSelectFields } from '../../../config/course-select-fields.config';
import { StudentTraining } from '../../../models/course.model';
import { DataResponse } from '../../../typings/response.types';
import { CoursesService } from '../../../services/courses.service';
import { Training, TrainingProfile, TrainingReply } from 'src/app/typings/training.types';
import { TrainingDataService } from '../../../services/training-data.service';
import { UserService } from 'src/app/services/user.service';

@Injectable()
export class StudentTrainingService {
	// private trainingStore$ = new BehaviorSubject<StudentTraining | null>(null);
    private profileStore$ = new ReplaySubject<TrainingProfile>(1)

    public profile$ = this.profileStore$.pipe(shareReplay(1))
    
	constructor(
        private userService: UserService,
        private trainingData: TrainingDataService,
        private coursesService: CoursesService
    ) {
		
	}

    public sendTrainingReply(reply: TrainingReply) {
        return this.trainingData.sendTrainingReply(reply)
    }

    public getProfile(options: { trainingId: string, studentId: string }) {
        return this.trainingData.getProfile(options);
	}
}
