import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, switchMap, tap } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-user-page',
	templateUrl: './user-page.component.html',
	styleUrls: ['./user-page.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPageComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public user$!: Observable<User | null>;

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private router: Router
	) {
		super();
		this.user$ = this.activatedRoute.paramMap.pipe(
			switchMap((params) => {
				const userId = Number(params.get('id'));
				if (Number.isNaN(userId)) {
					return of(null);
				}
				return this.userService.getUserById(userId);
			}),
			tap((user) => {
				if (user === null) {
					this.router.navigateByUrl('/app');
				}
			})
		);
	}

	ngOnInit(): void {}
}
