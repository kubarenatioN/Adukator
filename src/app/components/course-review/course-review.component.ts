import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, map, Observable, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
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
	public course$: Observable<Course | null>;

	constructor(
		private adminService: AdminService,
        private userService: UserService,
		private activatedRoute: ActivatedRoute,
        private coursesService: CoursesService,
		private router: Router
	) {
        super();
        this.course$ = this.activatedRoute.params.pipe(
            takeUntil(this.componentLifecycle$),
			switchMap((params) => {
                return this.adminService.getCourseById(Number(params['id']))
            }),
            withLatestFrom(this.userService.isAdmin$),
            tap(([course, isAdmin]) => {
                if (!course) {
                    if (isAdmin) {
                        this.router.navigate(['/app/admin']);
                    }
                    else {
                        this.router.navigate(['/app']);
                    }
                }
            }),
            map(([course]) => course)
		);
    }

	ngOnInit(): void {
		
	}

    public onPublish(id: number) {
        this.coursesService.publishCourse(id);
    }

    public onEdit(id: number) {
        
    }
}
