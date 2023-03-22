import {
    AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Observable } from 'rxjs';
import {
    EmptyCourseFormData,
	isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { moduleTopicsCountValidator } from 'src/app/helpers/course-validation';
import { convertCourseToCourseFormData } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { ConfigService } from 'src/app/services/config.service';
import {
    CourseBuilderViewData,
    CourseBuilderViewType,
	CourseFormData,
	CourseFormViewMode,
	CourseHierarchyComponent,
	CourseModule,
	CourseReview,
    ModuleTopic,
} from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-form',
	templateUrl: './course-form.component.html',
	styleUrls: ['./course-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent implements OnInit {
	private courseFormData: CourseFormData | null = null;
	private courseSecondaryId!: string;

    public categories$ = this.configService.loadCourseCategories();

	public courseForm;
	public viewModes = CourseFormViewMode;
    public formModes = CourseFormViewMode

    public overallInfoSubform;
    public modulesFormArray;

    public get viewType() {
        return this.viewData.type ?? null;
    }

	@Input() public formMode: CourseFormViewMode = CourseFormViewMode.Create;
	@Input() public viewData!: CourseBuilderViewData;
	// @Input() public viewType$!: Observable<CourseBuilderViewType>

	@Input() public set formData(
		data: CourseReview | EmptyCourseFormData
	) {
        console.log('111 form data', data);
		if (!isEmptyCourseFormData(data)) {
            const courseData = data as CourseReview;
            this.courseSecondaryId = courseData.secondaryId
            const courseFormData = convertCourseToCourseFormData(courseData);
			this.courseFormData = courseFormData;
			this.setCourseModel(courseFormData);
		} else {
            this.courseSecondaryId = (data as EmptyCourseFormData).uuid;
		}
	}

	@Output() public createReviewVersion = new EventEmitter<{
        isMaster: boolean;
        formData: CourseFormData;
    }>();
	@Output() public update = new EventEmitter<CourseFormData>();
	@Output() public moduleAdded = new EventEmitter<CourseModule[]>();

	constructor(private configService: ConfigService, private fbHelper: FormBuilderHelper) {
		this.courseForm = this.fbHelper.getNewCourseFormModel();
        
        this.overallInfoSubform = this.courseForm.controls.overallInfo;
        this.modulesFormArray = this.courseForm.controls.modules;
	}

	public ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			console.log('111 main course form', res);
		});

        // Initial modules emittion
        this.moduleAdded.emit(this.modulesFormArray.value as unknown as CourseModule[]);
	}

    public addModule() {
        const emptyModuleForm = this.fbHelper.getModuleForm();
        this.modulesFormArray.push(emptyModuleForm);
        this.moduleAdded.emit(this.modulesFormArray.value as unknown as CourseModule[]);
    }

	public removeModule(index: number): void {
		this.modulesFormArray.removeAt(index);
	}

    public getHierarchy(viewType: CourseBuilderViewType): CourseHierarchyComponent {
        if (viewType === 'module') {
            return {
                courseUUID: this.courseSecondaryId,
                module: this.viewData.module + 1
            }
        }
        return {
            courseUUID: this.courseSecondaryId,
            module: this.viewData.module + 1,
            topic: this.viewData?.topic + 1
        }
    }

	public onSubmit(action: CourseFormViewMode | 'publish'): void {
		const { valid: isValid } = this.courseForm;
        const { value } = this.courseForm;

		if (this.courseFormData !== null && action === 'create') {
			throw new Error('Cannot create not empty course.');
		}

		switch (action) {
			case 'create': {
                if (isValid && this.courseFormData === null) {
                    this.onCreateReviewVersion(value as unknown as CourseFormData, true)
				} else {
                    console.warn('Invalid form data.');
                }
				break;
			}
			case 'edit': {
				if (isValid && this.courseFormData) {
					this.onCreateReviewVersion(value as unknown as CourseFormData, false)
				}
				break;
			}

			default:
				break;
		}
	}

    public getView(type: Omit<CourseBuilderViewType, 'main'>) {
        try {
            if (!this.viewData) {
                throw new Error('No topic index was provided.');
            }
            const module = this.modulesFormArray.at(this.viewData.module)
            if (type === 'topic') {
                return module.controls.topics.at(this.viewData.topic);
            }
            if (type === 'module') {
                return module;
            }
        } catch (error) {
            console.warn('Error while resolving view.');
        }
        return null;
    }

    private onCreateReviewVersion(formData: CourseFormData, isMaster: boolean): void {
        this.createReviewVersion.emit({
            isMaster,
            formData,
        });
    }

	private setCourseModel(courseData: CourseFormData): void {
        this.fbHelper.fillCourseModel(this.courseForm, courseData)
	}
}
