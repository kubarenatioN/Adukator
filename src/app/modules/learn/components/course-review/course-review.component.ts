import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, shareReplay, switchMap, takeUntil } from 'rxjs';
import { CoursesService } from 'src/app/services/courses.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review',
	templateUrl: './course-review.component.html',
	styleUrls: ['./course-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewComponent extends BaseComponent implements OnInit {
	public courseHistory$: Observable<CourseReview[]>;
    public parentCourseId: number = -1;

	constructor(
        private location: Location,
        private activatedRoute: ActivatedRoute,
        private coursesService: CoursesService,
		private router: Router
	) {
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

    public onEdit(id: number) {
        
    }

    public goBack(): void {
        this.location.back()
    }
}
