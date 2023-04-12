import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-sidenav',
	templateUrl: './course-sidenav.component.html',
	styleUrls: ['./course-sidenav.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseSidenavComponent implements OnInit {
    @Input() public course!: Course
    
	constructor() {}

	ngOnInit(): void {
        
    }
}
