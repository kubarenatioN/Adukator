import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	Observable,
	take,
	map,
	withLatestFrom,
	switchMap,
	catchError,
	of,
	shareReplay,
    tap,
} from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { convertCourseFormDataToCourse, stringify } from 'src/app/helpers/courses.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { UserService } from 'src/app/services/user.service';
import { CourseFormData, CourseFormMetadata, CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review',
	templateUrl: './course-review.component.html',
	styleUrls: ['./course-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewComponent extends CenteredContainerDirective implements OnInit {
	private courseMetadata!: CourseFormMetadata;

	public formData$!: Observable<CourseReview>;

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private adminCoursesService: AdminCoursesService
	) {
        super();
    }

	public ngOnInit(): void {
		const queryParams$: Observable<{
			courseId?: number;
		}> = this.activatedRoute.paramMap.pipe(
			take(1),
			map((params) => {
				const courseId = Number(params.get('id'));
				return {
					courseId: isNaN(courseId) ? undefined : courseId,
				};
			})
		);

		this.formData$ = queryParams$.pipe(
			withLatestFrom(this.userService.user$),
			switchMap(([{ courseId }, user]) => {
				if (user !== null) {
					const { role } = user;
					if (role === 'admin' && courseId) {
						return this.adminCoursesService.getReviewCourse(courseId);
					}
				}
				throw new Error('Try to get course form data with no user.');
			}),
            tap(course => {
                this.courseMetadata = this.getCourseMetadata(course)
            }),
			catchError((err) => {
				console.error(err);
				return of(err);
			}),
			shareReplay(1)
		);
	}

    public onPublish(formData: CourseFormData): void {
        formData = this.restoreCourseMetadata(formData, this.courseMetadata)
        const courseData = convertCourseFormDataToCourse(formData)
        const masterId = formData.metadata.masterCourseId || formData.metadata.id
        this.adminCoursesService.publish(courseData, masterId)
            .subscribe(res => {
                console.log('111 course published', res);
            })
	}

	public onSaveReview(comments: { overallComments: string; modules: string }): void {
        const id = this.courseMetadata.id;
        this.adminCoursesService.saveCourseReview(id, comments)
            .subscribe(() => {
                console.log('course review updated');
            });
	}

    private getCourseMetadata(course: CourseReview): CourseFormMetadata {
        return {
            id: course.id,
            secondaryId: course.secondaryId,
            authorId: course.authorId,
            masterCourseId: course.masterId === null ? course.id : course.masterId, // if get master course, correct new course version masterId value
            status: course.status
        }
    }

    private restoreCourseMetadata(formData: CourseFormData, metadata: CourseFormMetadata): CourseFormData {
        formData.metadata = metadata
        return formData
    }
}
