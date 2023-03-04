import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { apiUrl } from '../constants/urls';

export interface CourseCategory {
    key: string;
    name: string
}

@Injectable({
	providedIn: 'root',
})
export class ConfigService {
    private courseCategories$: Observable<CourseCategory[]> | null = null
    
    private configFilesPath = `${apiUrl}/static/config`

	constructor(private http: HttpClient) {}

	public loadCourseCategories(): Observable<CourseCategory[]> {
        if (!this.courseCategories$) {
            this.courseCategories$ = this.http.get<any[]>(`${this.configFilesPath}/course-categories.json`).pipe(
                shareReplay(1)
            );
        }
        return this.courseCategories$;
    }
}
