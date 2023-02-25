import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { Course, CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-admin-courses-review',
	templateUrl: './admin-courses-review.component.html',
	styleUrls: ['./admin-courses-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesReviewComponent extends BaseComponent implements OnInit {
	@Input() public courses: CourseReview[] = [];

	constructor(private adminService: AdminService) {
        super()
    }

	ngOnInit(): void {
        
    }
}
