import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, of, switchMap } from 'rxjs';
import { Course, CourseBundle } from 'src/app/typings/course.types';
import { BundleService } from '../services/bundle.service';

@Component({
	selector: 'app-bundle-item',
	templateUrl: './bundle-item.component.html',
	styleUrls: ['./bundle-item.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BundleItemComponent implements OnInit {
	public bundle$!: Observable<CourseBundle | null>;

	constructor(
		private activatedRoute: ActivatedRoute,
		private bundleService: BundleService
	) {}

	ngOnInit(): void {
		this.bundle$ = this.activatedRoute.paramMap.pipe(
			switchMap((params) => {
				const bundleId = params.get('id');
				if (bundleId) {
					return this.bundleService.getSingleBundle(bundleId);
				}
				return of(null);
			}),
			map((res) => {
				return res ? res : null;
			})
		);
	}

	public startCourse(course: Course) {
		console.log('start course', course);
	}
}
