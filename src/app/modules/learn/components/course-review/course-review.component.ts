import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, shareReplay, switchMap, takeUntil } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review',
	templateUrl: './course-review.component.html',
	styleUrls: ['./course-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewComponent extends CenteredContainerDirective implements OnInit {
	public courseHistory$: Observable<CourseReview[]>;
    public parentCourseId: number = -1;

	constructor(
        private activatedRoute: ActivatedRoute,
        private coursesService: CoursesService	) {
        super();
        this.courseHistory$ = this.activatedRoute.params.pipe(
            takeUntil(this.componentLifecycle$),
			switchMap((params) => {
                const courseId = Number(params['id'])
                this.parentCourseId = courseId
                return this.coursesService.getCourseReviewHistory(courseId)
            }),
            shareReplay(1),
		);
    }

	ngOnInit(): void {
		
	}

    public onPublish() {        
        // TODO: create method like below
        // this.adminCoursesService.publish(this.parentCourseId)
    }

    public onEdit() {
        
    }
}
