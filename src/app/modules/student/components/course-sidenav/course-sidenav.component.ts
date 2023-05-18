import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { CourseContentTree } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-sidenav',
	templateUrl: './course-sidenav.component.html',
	styleUrls: ['./course-sidenav.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseSidenavComponent implements OnInit {
	@Input() public tree!: CourseContentTree;

	constructor() {}

	ngOnInit(): void {}
}
