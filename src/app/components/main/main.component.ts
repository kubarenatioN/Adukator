import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
	public user$: Observable<User | null>;
	public isAdmin$: Observable<boolean>;

	constructor(private userService: UserService) {
		this.user$ = this.userService.user$;
        this.isAdmin$ = this.userService.isAdmin$
	}

	ngOnInit(): void {}
}
