import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, take, map, withLatestFrom, switchMap, of, catchError, shareReplay, tap } from 'rxjs';
import { convertCourseToCourseFormData } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseFormDataMock } from 'src/app/mocks/course-form-data';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { UserService } from 'src/app/services/user.service';
import { CourseFormData, CourseFormViewMode, CourseReview } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-review-form',
	templateUrl: './course-review-form.component.html',
	styleUrls: ['./course-review-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewFormComponent implements OnInit {
    private courseFormData: CourseFormData | null = null;
	private courseSecondaryId!: string;
    
    public get editorComments() {
		return this.form.get('editorComments') as FormGroup;
	}

    public get editorModules(): FormArray {
		return this.editorComments.get('modules') as FormArray;
	}

    public get category(): string {
        return this.courseFormData?.categoryLabel || ''
    }

    public form: FormGroup;

    @Input()
    public set formData(courseData: CourseReview) {
        console.log('set review form data', courseData);
        this.courseSecondaryId = courseData.secondaryId
        const courseFormData = convertCourseToCourseFormData(courseData);
        this.courseFormData = courseFormData;
        this.fbHelper.fillCourseModel(this.form, courseFormData);
    }

	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter<CourseFormData>();
    
	constructor(private fbHelper: FormBuilderHelper) {
        this.form = this.fbHelper.fbRef.group({
			title: [CourseFormDataMock.title, Validators.required],
			description: [CourseFormDataMock.descr, Validators.required],
			category: ['', Validators.required],
			modules: this.fbHelper.fbRef.array([]),
			editorComments: this.fbHelper.fbRef.group({
				...this.fbHelper.getEmptyEditorComments(),
				modules: this.fbHelper.fbRef.array([]),
			}),
		});
    }

	public ngOnInit(): void {
		this.form.controls['editorComments'].valueChanges.subscribe(res => {
            console.log('111 review form changed', res);
        })
	}

    public onSubmit(action: 'review' | 'publish'): void {
		const { valid: isValid } = this.form;
        const { value }: { value: CourseFormData } = this.form;

		switch (action) {
			case 'review': {
				const { valid: isValid } = this.editorComments;
				if (isValid && this.courseFormData) {
					this.saveReview.emit(value);
				} else {
					console.error('Invalid review form');
				}
				break;
			}
			case 'publish': {
				// TEMP: skip validation
                // TODO: uncomment later
                // if (isValid && this.courseFormData && this.viewMode === this.viewModes.Review) {
				// 	this.publish.emit(value)
				// }
				this.publish.emit(value)
				break;
			}

			default:
				break;
		}
	}

    public getModuleEditorCommentsForm(moduleIndex: number): FormGroup {
        return this.editorModules.at(moduleIndex) as FormGroup;
    }

    public getTopicEditorCommentsForm(moduleIndex: number, topicIndex: number): FormGroup {
        const topic = ((this.editorModules.at(moduleIndex) as FormGroup).get('topics') as FormArray).at(topicIndex) as FormGroup
        return topic;
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
}
