import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, shareReplay, tap } from 'rxjs';
import { apiUrl } from '../constants/urls';
import { CourseCompetency } from '../typings/course.types';

export interface CourseCategory {
	key: string;
	name: string;
}

@Injectable({
	providedIn: 'root',
})
export class ConfigService {
	private courseCategories$: Observable<CourseCategory[]> | null = null;
	private courseCompetencies$: Observable<CourseCompetency[]> | null = null;

	private configFilesPath = `${apiUrl}/static/config`;

	public competencies: CourseCompetency[] = []

	public get competencies$() {
		if (!this.courseCompetencies$) {
			this.courseCompetencies$ = this.http.get<CourseCompetency[]>(
				`${this.configFilesPath}/course-competencies.json`
			)
				.pipe(shareReplay(1));
		}
		return this.courseCompetencies$;
	}

	constructor(private http: HttpClient) {}

	public loadCourseCategories(): Observable<CourseCategory[]> {
		if (!this.courseCategories$) {
			this.courseCategories$ = this.http
				.get<any[]>(`${this.configFilesPath}/course-categories.json`)
				.pipe(shareReplay(1));
		}
		return this.courseCategories$;
	}

	public loadCourseCompetencies(): Observable<CourseCompetency[]> {
		if (!this.courseCompetencies$) {
			this.courseCompetencies$ = this.http
				.get<CourseCompetency[]>(`${this.configFilesPath}/course-competencies.json`)
				.pipe(
					tap(comps => this.competencies = comps),
					shareReplay(1)
				);
		}
		return this.courseCompetencies$;
	}
}
