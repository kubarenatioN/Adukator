import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, takeUntil, switchMap, shareReplay } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review',
	templateUrl: './course-review.component.html',
	styleUrls: ['./course-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewComponent extends CenteredContainerDirective {
	public courseHistory$: Observable<CourseReview[]>;
	public parentCourseId: number = -1;

	constructor(
		private activatedRoute: ActivatedRoute,
		private coursesService: CoursesService
	) {
		super();
		this.courseHistory$ = this.activatedRoute.params.pipe(
			takeUntil(this.componentLifecycle$),
			switchMap((params) => {
				const courseId = Number(params['id']);
				this.parentCourseId = courseId;
				return this.coursesService.getCourseReviewHistory(courseId);
			}),
			shareReplay(1)
		);
	}
}
