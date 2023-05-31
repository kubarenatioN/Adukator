import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { combineLatest, debounceTime, map, Observable, startWith, switchMap } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import { LearnService } from '../../services/learn.service';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { Course, CourseBundle } from 'src/app/typings/course.types';
import { apiUrl } from 'src/app/constants/urls';
import { FormBuilder } from '@angular/forms';
import { ConfigService, CourseCategory } from 'src/app/services/config.service';

@Component({
	selector: 'app-courses-catalog',
	templateUrl: './catalog.component.html',
	styleUrls: ['./catalog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public list$!: Observable<Course[]>;
	public bundlesList$!: Observable<CourseBundle[]>;
	public categories$: Observable<CourseCategory[]>
	public isTeacherUser$ = this.userService.user$.pipe(
		map((user) => user?.permission === 'teacher')
	);
	public filtersForm

	public fallbackBanner = `${apiUrl}/static/images/course-bg-1.jpg`

	constructor(
		private learnService: LearnService,
		private userService: UserService,
		private configService: ConfigService,
		private fb: FormBuilder,
	) {
		super();
		this.categories$ = this.configService.loadCourseCategories()
		this.filtersForm = this.fb.group({
			search: [''],
			categories: [[] as string[]],
			sortBy: [null]
		})
	}

	public ngOnInit(): void {
		this.list$ = combineLatest([
			this.filtersForm.valueChanges.pipe(startWith({}), debounceTime(300)),
			this.learnService.coursesList$,
		])
		.pipe(
			map(([filters, courses]) => {
				return this.filterCourses(courses, filters)
			})
		)

		this.learnService.getCoursesList({
			pagination: {
				offset: 0,
				limit: 10,
			},
			fields: CoursesSelectFields.Short,
		});

		this.bundlesList$ = this.learnService.loadBundles();

		this.filtersForm.valueChanges.subscribe(filters => {

		})
	}

	public resetFilters() {
		this.filtersForm.patchValue({
			search: '',
			categories: [],
			sortBy: null,
		})
	}

	private filterCourses(courses: Course[], filters: typeof this.filtersForm.value) {
		let result = [...courses]
		const { search, categories, sortBy } = filters;
		
		if (categories && categories.length > 0) {						
			result = result.filter(course => categories.findIndex(c => c === course.category) > -1)
		}

		if (search && search !== '') {
			result = result.filter(course => course.title.toLowerCase().includes(search.toLowerCase()) || course.description.toLowerCase().includes(search.toLowerCase()))
		}

		if (sortBy) {
			if (sortBy === 'rating') {
				result.sort((a, b) => Number(a.rating ?? 0) - Number(b.rating ?? 0))
			}

			if (sortBy === '-createdAt') {
				result.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
			}

			if (sortBy === '+createdAt') {
				result.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
			}
		}

		return result
	}
}
