import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CourseFormModule, CourseModule } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-nav',
	templateUrl: './course-nav.component.html',
	styleUrls: ['./course-nav.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseNavComponent implements OnInit {
	@Input() public items: CourseFormModule[] = [];
	constructor(private router: Router) {}

	ngOnInit(): void {}

    public navigate(query: Record<string, string | number>) {
        this.router.navigate([], {
            queryParams: query,
            skipLocationChange: true,
        });
    }
}
