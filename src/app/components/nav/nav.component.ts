import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent implements OnInit {
	constructor(
		private userService: UserService,
		private router: Router,
	) {}

	ngOnInit(): void {}

	public logout() {
		this.userService.logout()
		this.router.navigateByUrl('/auth');
	}
}
