import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Training } from '../typings/training.types';
import { CoursesService } from './courses.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class StudentCoursesService {
	public courses$!: Observable<Training[]>;

	constructor() {}
}
