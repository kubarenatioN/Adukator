import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BundleService } from './services/bundle.service';
import { CourseBundle } from 'src/app/typings/course.types';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-bundle',
	templateUrl: './bundle.component.html',
	styleUrls: ['./bundle.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BundleComponent implements OnInit {
	public bundles$!: Observable<CourseBundle[]>;

	constructor(
		private bundleService: BundleService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.bundles$ = this.userService.user$.pipe(
			switchMap((user) => {
				return this.bundleService.getAuthorBundles(user._id);
			}),
			shareReplay(1)
		);
	}
}
