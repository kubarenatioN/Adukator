import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import { TrainingService } from './services/training.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public user$ = this.userService.user$;
	public profiles$ = this.trainingService.studentProfiles$;

	constructor(
		private userService: UserService,
		private trainingService: TrainingService
	) {
		super();
	}

	ngOnInit(): void {}
}
