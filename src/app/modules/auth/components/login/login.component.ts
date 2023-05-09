import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends BaseComponent implements OnInit {
	public form: FormGroup;
	public isSubmitDisabled = false;

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
		private cd: ChangeDetectorRef,
		private router: Router
	) {
		super();
		this.form = this.fb.group({
			email: [
				'',
				Validators.compose([Validators.required, Validators.email]),
			],
			password: ['', Validators.required],
		});
	}

	public ngOnInit(): void {}

	public onSubmit(): void {
		const { value, valid } = this.form;
		if (valid) {
			this.isSubmitDisabled = true;
			this.userService.login(value).subscribe(
				(user) => {
					if (user !== null) {
						this.router.navigate(['app']);
					}
				},
				(err) => {
					console.error('Login Error', err);
					setTimeout(() => {
						this.isSubmitDisabled = false;
						this.cd.detectChanges();
					}, 500);
				}
			);
		}
	}

	public login(method: 'google' | 'twitter') {
		switch (method) {
			case 'google':
				window.open(
					DATA_ENDPOINTS.auth.login.google,
					'_blank',
					'popup'
				);
				break;
			default:
				break;
		}
	}
}
