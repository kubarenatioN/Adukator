import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	constructor(private authService: AuthService, private router: Router) {
		this.checkAccess();
	}

	private checkAccess(): void {
		if (!this.authService.hasUserToken()) {
			this.router.navigate(['auth']);
		}
	}
}
