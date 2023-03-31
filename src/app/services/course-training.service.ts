import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { CourseTraining } from '../models/course.model';

@Injectable({
	providedIn: 'root',
})
export class CourseTrainingService {
	private courseStore$ = new BehaviorSubject<CourseTraining | null>(null);

	public course$: Observable<CourseTraining | null>;
    
    public set course(value: CourseTraining | null) {
        this.courseStore$.next(value);
    }
    
    public get course(): CourseTraining | null {
        return this.courseStore$.value;
    }

	constructor() {
		this.course$ = this.courseStore$.asObservable().pipe(shareReplay(1));
	}

}
