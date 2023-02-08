import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends BaseComponent {
	public form: FormGroup;
	public isSubmitDisabled = false;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
        // TODO: remove UserService
        public userService: UserService,
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

    public login(method: 'google' | 'twitter') {
        switch (method) {
            case 'google':
                window.open('http://localhost:8080/auth/login/google', '_blank', 'popup')
                break;
            default:
                break;
        }
    }
}
