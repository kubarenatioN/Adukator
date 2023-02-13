import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, map, Observable, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review',
	templateUrl: './course-review.component.html',
	styleUrls: ['./course-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewComponent extends BaseComponent implements OnInit {
	public courseHistory$: Observable<Course[]>;
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
        this.coursesService.publishCourse(this.parentCourseId)
    }

    public onEdit(id: number) {
        
    }

    public goBack(): void {
        this.location.back()
    }
}
