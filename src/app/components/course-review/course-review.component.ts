import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { CoursesService } from 'src/app/services/courses.service';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review',
	templateUrl: './course-review.component.html',
	styleUrls: ['./course-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewComponent implements OnInit {
	public course$: Observable<Course | null>;

	constructor(
		private adminService: AdminService,
		private activatedRoute: ActivatedRoute,
        private coursesService: CoursesService,
		private router: Router
	) {
        this.course$ = this.activatedRoute.params.pipe(
			switchMap((params) => {
                return this.adminService.getCourseById(Number(params['id']))
            }),
            tap(course => {
                if (!course) {
                    this.router.navigate(['/admin']);
                }
            })
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
