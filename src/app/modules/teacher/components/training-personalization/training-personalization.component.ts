import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { TopicTask } from 'src/app/typings/course.types';
import {
	Training,
	TrainingProfileTraining,
} from 'src/app/typings/training.types';
import { PersonalizationService } from '../../services/personalization.service';

type ViewData = {
	trainings: Training[];
	profiles: TrainingProfileTraining[];
	tasks: TopicTask[];
};

@Component({
	selector: 'app-training-personalization',
	templateUrl: './training-personalization.component.html',
	styleUrls: ['./training-personalization.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPersonalizationComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public viewData$!: Observable<ViewData>;

	constructor(private personalizationService: PersonalizationService) {
		super();
	}

	ngOnInit(): void {}
}
