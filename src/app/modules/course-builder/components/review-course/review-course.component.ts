import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-review-course',
	templateUrl: './review-course.component.html',
	styleUrls: ['./review-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCourseComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
