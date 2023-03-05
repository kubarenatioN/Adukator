import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
	public user$ = this.userService.user$;

	constructor(private userService: UserService) {}

	ngOnInit(): void {}
}
