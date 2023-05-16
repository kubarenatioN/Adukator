import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, map, shareReplay } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { CoursesService } from 'src/app/services/courses.service';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { Course } from 'src/app/typings/course.types';
import { Training } from 'src/app/typings/training.types';

@Injectable({
	providedIn: 'root',
})
export class LearnService {
	private trainingsListStore$ = new BehaviorSubject<Training[]>([]);
	private coursesListStore$ = new BehaviorSubject<Course[]>([]);

	public trainingsList$: Observable<Training[]> = this.trainingsListStore$
		.asObservable()
		.pipe(shareReplay(1));

	public coursesList$: Observable<Course[]> = this.coursesListStore$
		.asObservable()
		.pipe(shareReplay(1));
	// public training$ = this.trainingStore$.pipe(shareReplay(1));

	constructor(
		private trainingDataService: TrainingDataService,
		private coursesService: CoursesService
	) {}

	public getCoursesList(options: {
		pagination?: {
			offset: number;
			limit: number;
		};
		filters?: {};
		fields: string[];
	}) {
		this.coursesService
			.getCoursesList(options)
			.pipe(map(res => res.data))
			.subscribe(courses => {
				return this.coursesListStore$.next(courses)
			});
	}

	public loadBundles() {
		return this.coursesService.getCourseBundles();
	}

	public getTraining(trainingId: string) {
		return this.trainingDataService.getTrainings({
			trainingsIds: [trainingId],
			fields: CoursesSelectFields.Full,
		});
	}

	public getCourse(courseId: string) {
		return this.coursesService.getCourses<{ data: Course[] }>({
			coursesIds: [courseId],
			type: 'published',
			reqId: 'OverviewCourse',
			fields: CoursesSelectFields.Full,
		});
	}

	public getCourseTrainings(courseId: string) {
		return this.coursesService.getCourseTrainings(courseId).pipe(
			map(res => res.trainings)
		)
	}

	public lookupTraining(studentsIds: string[], trainingId: string) {
		return this.trainingDataService.lookupEnrollment(
			studentsIds,
			trainingId
		);
	}

	public changeProfileEnrollment(
		studentsIds: string[],
		trainingId: string,
		key: string
	) {
		return this.trainingDataService.changeTrainingEnrollment(
			studentsIds,
			trainingId,
			key
		);
	}
}
