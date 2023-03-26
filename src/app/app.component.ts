import { Component } from '@angular/core';
import { ConfigService } from './services/config.service';
import { UserService } from './services/user.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	constructor(private userService: UserService, private configService: ConfigService) {
        (window as any).__localeId__ = 'ru'
		window.addEventListener('message', (e) => this.setToken(e));
		this.userService.initUser();
        this.configService.loadCourseCompetencies();
    }

	private setToken(e: MessageEvent) {
		if (
			e.data &&
			e.data.command === 'token-ready' &&
			e.data.info &&
			e.data.info.token
		) {
            localStorage.setItem('token', e.data.info.token);
            this.userService.initUser();

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
