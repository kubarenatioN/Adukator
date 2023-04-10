import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { CourseTraining } from '../models/course.model';
import { UploadService } from './upload.service';

@Injectable({
	providedIn: 'root',
})
export class CourseTrainingService {
	private courseStore$ = new BehaviorSubject<CourseTraining | null>(null);
    private courseValue: CourseTraining | null = null
    
	public course$: Observable<CourseTraining>;

    public set course(value: CourseTraining | null) {
        this.courseStore$.next(value);
        this.courseValue = value;
    }
    
    public get course(): CourseTraining | null {
        return this.courseValue
    }

	constructor(private uploadService: UploadService) {
		this.course$ = this.courseStore$.asObservable().pipe(
            filter(Boolean),
            shareReplay(1)
        );
	}

    public getUploadFolder(type: 'tasks' | 'topics', controlId: string): Observable<string> {
        return this.course$.pipe(
            map(course => this.uploadService.getFilesFolder(course.id, type, controlId))
        )
    }
}
