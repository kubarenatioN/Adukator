import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import { LearnService } from '../../services/learn.service';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { Course, CourseBundle } from 'src/app/typings/course.types';
import { apiUrl } from 'src/app/constants/urls';

@Component({
	selector: 'app-courses-catalog',
	templateUrl: './catalog.component.html',
	styleUrls: ['./catalog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public list$!: Observable<Course[]>;
	public bundlesList$!: Observable<CourseBundle[]>;

	public isTeacherUser$ = this.userService.user$.pipe(
		map((user) => user?.permission === 'teacher')
	);

	public fallbackBanner = `${apiUrl}/static/images/course-bg-1.jpg`

	constructor(
		private learnService: LearnService,
		private userService: UserService
	) {
		super();
	}

	public ngOnInit(): void {
		this.list$ = this.learnService.coursesList$;
		this.learnService.getCoursesList({
			pagination: {
				offset: 0,
				limit: 10,
			},
			fields: CoursesSelectFields.Short,
		});

		this.bundlesList$ = this.learnService.loadBundles();
	}
}
