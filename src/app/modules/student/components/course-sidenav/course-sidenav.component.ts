import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { StudentTraining } from 'src/app/models/course.model';

@Component({
	selector: 'app-course-sidenav',
	templateUrl: './course-sidenav.component.html',
	styleUrls: ['./course-sidenav.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseSidenavComponent implements OnInit {
	@Input() public training!: StudentTraining;

	constructor() {}

	ngOnInit(): void {}
}
