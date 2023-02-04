import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { CoursesService } from 'src/app/services/courses.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-admin-courses-review',
	templateUrl: './admin-courses-review.component.html',
	styleUrls: ['./admin-courses-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesReviewComponent extends BaseComponent implements OnInit {
	@Input() public courses: Course[] = [];

	constructor(private adminService: AdminService) {
        super()
    }

	ngOnInit(): void {
        this.adminService.courses$
        .pipe(
            takeUntil(this.componentLifecycle$)
        )
        .subscribe(c => {
            console.log('admin courses', c);
        })
    }
}
