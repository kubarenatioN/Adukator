import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, of, switchMap, switchMapTo } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { CoursesService } from 'src/app/services/courses.service';
import { CourseBundle } from 'src/app/typings/course.types';

@Component({
	selector: 'app-bundle-overview',
	templateUrl: './bundle-overview.component.html',
	styleUrls: ['./bundle-overview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BundleOverviewComponent implements OnInit {
	public bundle$!: Observable<CourseBundle | null>;

	constructor(
		private coursesService: CoursesService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.bundle$ = this.activatedRoute.paramMap.pipe(
			switchMap((params) => {
				const id = params.get('id');
				if (id) {
					return this.coursesService.getCourseBundles({
						uuids: id,
						courseFields: CoursesSelectFields.Full.join(','),
					});
				}
				return of(null);
			}),
			map((res) => {
				return res ? res[0] : null;
			})
		);
	}
}
