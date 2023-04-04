import {
	ChangeDetectionStrategy,
	Component,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-courses-catalog',
	templateUrl: './catalog.component.html',
	styleUrls: ['./catalog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent extends CenteredContainerDirective {
	public courses$: Observable<Course[]>;

	public isTeacherUser$ = this.userService.user$.pipe(
		map((user) => user?.role === 'teacher')
	);

	constructor(
		private coursesService: CoursesService,
		private userService: UserService
	) {
		super();
		this.courses$ = this.coursesService.catalogCourses$;
        this.coursesService.getCoursesList({
            pagination: {
                offset: 0,
                limit: 10,
            },
            fields: CoursesSelectFields.Short
        })
	}
}
