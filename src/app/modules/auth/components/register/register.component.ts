import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UserService } from 'src/app/services/user.service';
import { User, UserRegisterData } from 'src/app/typings/user.types';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
	public form;
	public isLoading = false;
	
	constructor(
		private fbHelper: FormBuilderHelper,
		private userService: UserService,
		private cd: ChangeDetectorRef,
		private router: Router,
	) {
		this.form = this.fbHelper.fbRef.group({
			email: ['', Validators.compose([Validators.required, Validators.email]),],
			password: ['', [Validators.required, Validators.min(4)]],
			passwordRepeat: ['', [Validators.required, Validators.min(4)]],
		})
	}

	ngOnInit(): void {}

	public onSubmit() {
		const { value, invalid } = this.form;
		if (invalid) {
			return;
		}
		const { email, password, passwordRepeat } = value;
		if (!email || !password || !passwordRepeat) {
			return;
		}
		const userData: UserRegisterData = {
			email,
			password,
			passwordRepeat,
		}
		this.registerUser(userData)
	}

	private registerUser(userData: UserRegisterData) {
		this.isLoading = true;
		this.userService.register(userData).subscribe(
			(user) => {
				if (user !== null) {
					this.router.navigate(['app']);
				}
			},
			(err) => {
				console.error('Login Error', err);
				setTimeout(() => {
					this.isLoading = false;
					this.cd.detectChanges();
				}, 500);
			}
		);
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
