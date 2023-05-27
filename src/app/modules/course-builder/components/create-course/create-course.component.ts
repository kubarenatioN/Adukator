import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	combineLatest,
	Observable,
	BehaviorSubject,
	throwError,
} from 'rxjs';
import {
	catchError,
	map,
	shareReplay,
	switchMap,
} from 'rxjs/operators';
import { EmptyCourseFormData } from 'src/app/constants/common.constants';
import { UserService } from 'src/app/services/user.service';
import {
	CourseBuilderViewData,
	CourseBuilderViewType,
	CourseFormData,
	CourseFormViewMode,
	CourseReview,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';
import { generateUUID } from 'src/app/helpers/courses.helper';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent
	implements OnInit
{
	public formMode: CourseFormViewMode = CourseFormViewMode.Create;
	public formData$!: Observable<CourseReview | EmptyCourseFormData | null>;
	public viewData$!: Observable<CourseBuilderViewData>;

	public showLoading$ = new BehaviorSubject<boolean>(false);

	constructor(
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private courseBuilderService: CourseBuilderService,
		private router: Router
	) {
	}

	public ngOnInit(): void {
		const { mode } = this.activatedRoute.snapshot.data as {
			mode: CourseFormViewMode;
		};

		this.viewData$ = this.courseBuilderService.viewData$;

		const navQuery$ = this.activatedRoute.queryParams.pipe(
			map((query) => {
				const module = query['module'];
				const topic = query['topic'];

				const viewType = this.resolveViewType(module, topic);
				return {
					type: viewType,
					module,
					topic,
				};
			}),
			shareReplay(1)
		);

		this.formData$ = this.activatedRoute.paramMap.pipe(
			switchMap((params) => {
				let courseId;
				if (mode === CourseFormViewMode.Create) {
					courseId = generateUUID();
				} else {
					courseId = String(params.get('id'));
				}
				this.courseBuilderService.courseId = courseId;
				return this.courseBuilderService.getFormData(courseId, mode);
			}),
			shareReplay(1)
		);

		combineLatest([navQuery$, this.formData$]).subscribe(([navQuery, formData]) => {
			this.courseBuilderService.setViewData(navQuery, mode);
		});
	}

	public onCreateReviewVersion(payload: {
		formData: CourseFormData;
		isMaster: boolean;
	}): void {
		const timeoutId = this.queueRedirect(['/app/teacher']);

		this.courseBuilderService
			.createCourseReviewVersion(payload)
			.pipe(
				catchError((err) => {
					clearTimeout(timeoutId);
					return throwError(() => err);
				})
			)
			.subscribe({
				next: (res) => {
					if (res) {
						console.log('Course review new version created!', res);
					}
				},
				error: (err) => {
					console.error(err.message);
				},
			});
	}
	// TODO: return stream back, to refresh state after request
	

	public onFormChanged(form: FormGroup) {
		this.courseBuilderService.rebuildContentTree(form)
	}

	private resolveViewType(
		module?: string,
		topic?: string
	): CourseBuilderViewType {
		if (module) {
			return 'module';
		}
		if (topic) {
			return 'topic';
		}
		return 'main';
	}

	private queueRedirect(url: string[]) {
		return setTimeout(() => {
			this.router.navigate(url);
		}, 2000);
	}
}
