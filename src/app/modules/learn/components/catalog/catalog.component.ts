import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { map, Observable, takeUntil, tap } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { BaseComponent } from 'src/app/shared/base.component';
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
		this.courses$ = this.coursesService.courses$;
	}
}
