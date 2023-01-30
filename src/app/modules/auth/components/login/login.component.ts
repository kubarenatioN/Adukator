import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
	public form: FormGroup;
	public isSubmitDisabled = false;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private cd: ChangeDetectorRef,
		private router: Router
	) {
		this.form = this.fb.group({
			email: [
				'',
				Validators.compose([Validators.required, Validators.email]),
			],
			password: ['', Validators.required],
		});
	}

	public onSubmit(): void {
		const { value, valid } = this.form;
		if (valid) {
			this.isSubmitDisabled = true;
			this.authService.login(value).subscribe(
				(res) => {
					this.router.navigate(['app']);
				},
				(err) => {
					console.error('Login Error', err);
					this.isSubmitDisabled = false;
					this.cd.markForCheck();
				}
			);
		}
	}
}
