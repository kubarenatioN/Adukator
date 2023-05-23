import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import { DashboardService } from './services/dashboard.service';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { StudentDashboard } from './types/dashboard.types';

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
	public dashboard$!: Observable<StudentDashboard>

	constructor(
		private userService: UserService,
		private dashboardService: DashboardService
	) {
		super();
	}

	ngOnInit(): void {
		this.dashboard$ = this.user$.pipe(
			switchMap(user => {
				return this.dashboardService.getDashboard(user._id)
			}),
			shareReplay(1),
		)
	}
}
