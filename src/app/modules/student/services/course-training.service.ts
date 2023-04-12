import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { CoursesSelectFields } from '../../../config/course-select-fields.config';
import { StudentTraining } from '../../../models/course.model';
import { DataResponse } from '../../../typings/response.types';
import { CoursesService } from '../../../services/courses.service';
import { UploadPathSegment, UploadService } from '../../../services/upload.service';
import { Training, TrainingProfile, TrainingReply, TrainingTaskAnswer } from 'src/app/typings/training.types';
import { TrainingDataService } from './training-data.service';
import { UserService } from 'src/app/services/user.service';

@Injectable()
export class CourseTrainingService {
	private trainingStore$ = new BehaviorSubject<StudentTraining | null>(null);
    
	public training$: Observable<StudentTraining>;
    
	constructor(
        private userService: UserService,
        private trainingData: TrainingDataService,
        private uploadService: UploadService, 
        private coursesService: CoursesService
    ) {
		this.training$ = this.trainingStore$.asObservable().pipe(
            filter(Boolean),
            shareReplay(1)
        );
	}

    public getCourseTraining(courseId: string) {
        return this.coursesService.getCourses<DataResponse<Training[]>>({
            coursesIds: [courseId],
            type: 'training',
            fields: CoursesSelectFields.Full,
            reqId: 'StudentCourseTraining'
        }).subscribe(trainingMeta => {
            const training = trainingMeta.data[0];
            this.trainingStore$.next(new StudentTraining(training))
        })
    }

    public sendTrainingReply(reply: TrainingReply) {
		console.log('111 send answer', reply);
        return this.trainingData.sendTrainingReply(reply)
    }
}
