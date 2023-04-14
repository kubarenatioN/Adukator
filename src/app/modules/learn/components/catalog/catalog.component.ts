import {
	ChangeDetectionStrategy,
	Component,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { TrainingService } from 'src/app/services/training.service';
import { UserService } from 'src/app/services/user.service';
import { Training } from 'src/app/typings/training.types';
import { LearnService } from '../../services/learn.service';

@Component({
	selector: 'app-courses-catalog',
	templateUrl: './catalog.component.html',
	styleUrls: ['./catalog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent extends CenteredContainerDirective {
	public list$: Observable<Training[]>;

	public isTeacherUser$ = this.userService.user$.pipe(
		map((user) => user?.role === 'teacher')
	);

	constructor(
		private learnService: LearnService,
		private userService: UserService
	) {
		super();
		this.list$ = this.learnService.trainingsList$;
	}
}
