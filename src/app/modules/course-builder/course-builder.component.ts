import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CourseBuilderService } from './services/course-builder.service';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';

@Component({
	selector: 'app-course-builder',
	templateUrl: './course-builder.component.html',
	styleUrls: ['./course-builder.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseBuilderComponent extends CenteredContainerDirective implements OnInit {
	public contentTree$ = this.courseBuilder.contentTree$
	
	constructor(
		private courseBuilder: CourseBuilderService,
	) {
		super()
	}

	ngOnInit(): void {}
}
