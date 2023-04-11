import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { CoursesSelectFields } from '../../../config/course-select-fields.config';
import { StudentTraining } from '../../../models/course.model';
import { CourseTrainingMeta } from '../../../typings/course.types';
import { DataResponse } from '../../../typings/response.types';
import { CoursesService } from '../../../services/courses.service';
import { UploadPathSegment, UploadService } from '../../../services/upload.service';

@Injectable()
export class CourseTrainingService {
	private trainingStore$ = new BehaviorSubject<StudentTraining | null>(null);
    
	public training$: Observable<StudentTraining>;
    
	constructor(private uploadService: UploadService, private coursesService: CoursesService) {
		this.training$ = this.trainingStore$.asObservable().pipe(
            filter(Boolean),
            shareReplay(1)
        );
	}

    public getCourseTraining(courseId: string) {
        this.coursesService.getCourses<DataResponse<CourseTrainingMeta[]>>({
            coursesIds: [courseId],
            type: 'training',
            fields: CoursesSelectFields.Full,
            reqId: 'StudentCourseTraining'
        }).subscribe(trainingMeta => {
            const course = trainingMeta.data[0].course;
            this.trainingStore$.next(new StudentTraining(course))
        })
    }

    public getUploadFolders(components: { segments: UploadPathSegment[], controlId: string}[]): Observable<string[]> {
        return this.training$.pipe(
            map(course => {
                return components.map(({ segments, controlId }) => {
                    return this.uploadService.getFilesFolder(course.id, segments, controlId)
                })
            })
        )
    }
}
