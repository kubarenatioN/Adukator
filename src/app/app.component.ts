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
		window.addEventListener('message', (e) => this.setToken(e));
		this.authService.initUser();
	}

	private setToken(e: MessageEvent) {
		if (
			e.data &&
			e.data.command === 'token-ready' &&
			e.data.info &&
			e.data.info.token
		) {
            localStorage.setItem('token', e.data.info.token);
            this.authService.initUser();

			e.source?.postMessage({
                command: 'info',
                info: {
                    complete: true,
                },
            }, {
                targetOrigin: e.origin
            })
		}
	}
}
