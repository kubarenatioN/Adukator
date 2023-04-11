import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';

@Component({
	selector: 'app-course-topic-check',
	templateUrl: './course-topic-check.component.html',
	styleUrls: ['./course-topic-check.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseTopicCheckComponent
	extends CenteredContainerDirective
	implements OnInit
{
	constructor() {
		super();
	}

	ngOnInit(): void {}
}
