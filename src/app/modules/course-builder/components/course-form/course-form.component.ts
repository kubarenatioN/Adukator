import {
    AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
    CourseBuilderViewPath,
    CourseBuilderViewType,
	CourseFormData,
	CourseFormViewMode,
	CourseHierarchyComponent,
	CourseModule,
	CourseReview,
    ModuleTopic,
    WrapperType,
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
	public activeFormGroup!: FormGroup;
    public get overallInfoSubform() {
        return this.courseForm.controls.overallInfo;
    };
    public get modulesFormArray() {
        return this.courseForm.controls.modules;
    };

    public formMode!: CourseFormViewMode;
    public viewType!: CourseBuilderViewType;

    public viewModes = CourseFormViewMode;
    public controlsType: WrapperType = 'edit'

    @Input() public set formData(data: CourseReview | EmptyCourseFormData | null) {
        if (data === null) {
            return;
        }
        if (isEmptyCourseFormData(data)) {
            this.courseSecondaryId = data.uuid;
            this.formChanged.emit(this.courseForm);
        } 
        else {
            const formData = convertCourseToCourseFormData(data);
            this.setCourseModel(formData)
        }
    }

    @Input() public set viewData(value: CourseBuilderViewData | null) {
        if (value === null) {
            return;
        }
        const { metadata, mode, viewPath } = value;
        this.formMode = mode;
        this.viewType = viewPath.type;
        this.courseSecondaryId = metadata.secondaryId;
        this.activeFormGroup = this.getFormGroup(viewPath)
    }

	@Output() public createReviewVersion = new EventEmitter<{
        isMaster: boolean;
        formData: CourseFormData;
    }>();
	@Output() public update = new EventEmitter<CourseFormData>();
	// @Output() public modulesChanged = new EventEmitter<CourseModule[]>();
	@Output() public formChanged = new EventEmitter<typeof this.courseForm>();

	constructor(private configService: ConfigService, 
		private cd: ChangeDetectorRef,
        private fbHelper: FormBuilderHelper) {
		this.courseForm = this.fbHelper.getNewCourseFormModel();
	}

	public ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			console.log('111 main course form', res);
            this.formChanged.emit(this.courseForm);
		});

        // this.modulesChanged.emit(this.modulesFormArray.value as unknown as CourseModule[]);
	}

    public addModule() {
        const emptyModuleForm = this.fbHelper.getModuleForm();
        this.courseForm.controls.modules.push(emptyModuleForm);
        console.log(this.modulesFormArray.value);
        // this.modulesChanged.emit(this.modulesFormArray.value as unknown as CourseModule[]);
    }

    public addTopic(moduleForm: typeof this.modulesFormArray.controls[0]) {
        const emptyTopicForm = this.fbHelper.getTopicForm();
        const topicsArray = moduleForm.controls.topics;
        topicsArray.push(emptyTopicForm)
        moduleForm.controls.topics = topicsArray;
        console.log(topicsArray, this.modulesFormArray.value);
        // this.modulesChanged.emit(this.modulesFormArray.value as unknown as CourseModule[]);
    }

	public removeModule(index: number): void {
		this.modulesFormArray.removeAt(index);
	}

    public getHierarchy(viewType: CourseBuilderViewType): CourseHierarchyComponent {
        return {
            courseUUID: this.courseSecondaryId,
            module: 1,
            topic: 1
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

    private getFormGroup({ type, module, topic}: CourseBuilderViewPath): FormGroup {
        try {
            if (type === 'main') {
                return this.courseForm.controls.overallInfo;
            }
            if (module != null) {
                const moduleForm = this.courseForm.controls.modules.at(module);
                if (type === 'module') {
                    return moduleForm;
                }
                if (topic != null && type === 'topic') {
                    return moduleForm.controls.topics.at(topic);
                }
            }
            throw new Error('Cannot resolve with type. Fallback with overall info form.')
        } catch (error) {
            this.viewType = 'main';
            return this.courseForm.controls.overallInfo
        }
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
