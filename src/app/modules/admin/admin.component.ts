import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { AdminService } from 'src/app/services/admin.service';
import { Course, CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public reviewCoursesList$!: Observable<CourseReview[]>;

	constructor(private adminService: AdminService) {
		super();
	}

	ngOnInit(): void {
		this.reviewCoursesList$ = this.adminService.reviewCoursesList$;
	}
}
