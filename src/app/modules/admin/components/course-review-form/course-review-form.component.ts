import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, take, map, withLatestFrom, switchMap, of, catchError, shareReplay, tap } from 'rxjs';
import { convertCourseToCourseFormData, stringify } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseFormDataMock } from 'src/app/mocks/course-form-data';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseFormData, CourseFormViewMode, CourseReview, WrapperType } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review-form',
	templateUrl: './course-review-form.component.html',
	styleUrls: ['./course-review-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewFormComponent implements OnInit {
    private courseFormData: CourseFormData | null = null;
	private courseSecondaryId!: string;

    public get category(): string {
        return this.courseFormData?.overallInfo.categoryLabel || ''
    }

    public form;
    public overallInfoForm;
    public modulesFormArray;

    public controlsType: WrapperType = 'review';

    @Input()
    public set formData(courseData: CourseReview) {
        console.log('set review form data', courseData);
        this.courseSecondaryId = courseData.secondaryId
        const courseFormData = convertCourseToCourseFormData(courseData);
        this.courseFormData = courseFormData;
        this.fillReviewForm(courseFormData)
    }

	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter<{ overallComments: string; modules: string }>();
    
	constructor(private fbHelper: FormBuilderHelper) {
        this.form = this.fbHelper.getNewCourseFormModel();

        this.overallInfoForm = this.form.controls.overallInfo
        this.modulesFormArray = this.form.controls.modules
    }

	public ngOnInit(): void {
		this.form.valueChanges.subscribe(res => {
            console.log('111 review form changed', res);
        })
	}

    public onSubmit(action: 'review' | 'publish'): void {
		const { valid: isValid } = this.form;
        const { value } = this.form;

		switch (action) {
			case 'review': {
                const comments: { overallComments: string; modules: string } = {
                    overallComments: stringify(this.overallInfoForm.value.comments),
                    modules: stringify(this.modulesFormArray.value),
                }
                this.saveReview.emit(comments);
				break;
			}
			case 'publish': {
				// TEMP: skip validation
                // TODO: uncomment later
                // if (isValid && this.courseFormData && this.viewMode === this.viewModes.Review) {
				// 	this.publish.emit(value)
				// }
				this.publish.emit(value as unknown as CourseFormData)
				break;
			}

			default:
				break;
		}
	}

    public getReviewTopicFolderPath(module: number, topic: number) {
        return UploadHelper.getTopicUploadFolder({
            courseUUID: this.courseSecondaryId,
            module,
            topic,
        })
    }

    public getReviewTaskFolderPath(module: number, topic: number, task: number) {
        return UploadHelper.getTaskUploadFolder({
            courseUUID: this.courseSecondaryId,
            module,
            topic,
            task
        })
    }

    private fillReviewForm(formData: CourseFormData) {
        if (!this.form) {
            this.form = this.fbHelper.getNewCourseFormModel();
        }
        this.fbHelper.fillCourseModel(this.form, formData);
        this.overallInfoForm = this.form.controls.overallInfo
        this.modulesFormArray = this.form.controls.modules
    }
}