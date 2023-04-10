import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import {
    distinctUntilChanged,
    map,
	shareReplay,
	switchMap,
    withLatestFrom,
} from 'rxjs/operators';
import {
    EmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { UserService } from 'src/app/services/user.service';
import { CourseBuilderViewData, CourseBuilderViewType, CourseFormData, CourseFormMetadata, CourseFormViewMode, CourseModule, CourseReview } from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent extends CenteredContainerDirective implements OnInit, OnDestroy {
	private modulesStore$ = new ReplaySubject<CourseModule[]>(1);

    public formMode: CourseFormViewMode = CourseFormViewMode.Create;

	public modules$: Observable<CourseModule[]>;
    public formData$!: Observable<CourseReview | EmptyCourseFormData | null>;
    public viewData$!: Observable<CourseBuilderViewData>;

	public showLoading$ = new BehaviorSubject<boolean>(false);

	constructor(
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private courseBuilderService: CourseBuilderService,
	) {
        super();
        this.modules$ = this.modulesStore$.asObservable();
    }

	public ngOnInit(): void {
        const { mode } = this.activatedRoute.snapshot.data as { mode: CourseFormViewMode };
        const navQuery$ = this.activatedRoute.queryParams
            .pipe(
                map((query) => {                    
                    const module = query['module'];
                    const topic = query['topic'];
                    
                    const viewType = this.resolveViewType(module, topic)
                    return {
                        type: viewType,
                        module,
                        topic,
                    }
                }),
                shareReplay(),
            );

		this.formData$ = this.activatedRoute.paramMap.pipe(
            switchMap(params => {
                const courseId = String(params.get('id'));
                return this.courseBuilderService.getFormData(courseId, mode)
            })
        )

        navQuery$.pipe(
            withLatestFrom(this.formData$),
        ).subscribe(([navQuery]) => {
            this.courseBuilderService.setViewData(navQuery, mode)
        })

        this.viewData$ = this.courseBuilderService.viewData$
	}

	public onCreateReviewVersion(payload: { formData: CourseFormData, isMaster: boolean }): void {
        this.courseBuilderService.createCourseReviewVersion(payload)
            .subscribe((res) => {
                console.log('Course review new version created!', res);
            });
	}

    public onPublish(formData: CourseFormData): void {
        this.courseBuilderService.publishCourse(formData)
            .subscribe(res => {
                console.log('Published course!', res);
            })
	}

	public onSaveReview(comments: { overallComments: unknown; modules: unknown }): void {
        this.courseBuilderService.saveCourseReview(comments)
            .subscribe((res) => {
                console.log('Course review created!', res);
            });
	}

    public onFormChanged(form: FormGroup) {
        this.modulesStore$.next(form.controls['modules'].value);
    }

    private resolveViewType(module?: string, topic?: string): CourseBuilderViewType {
        if (module) {
            return 'module'
        }
        if (topic) {
            return 'topic'
        }
        return 'main';
    }
}
