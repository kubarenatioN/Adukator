import {
    ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    EmptyCourseFormData,
	isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { convertCourseToCourseFormData, stringify } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { ConfigService } from 'src/app/services/config.service';
import {
    CourseBuilderViewData,
    CourseBuilderViewPath,
    CourseBuilderViewType,
	CourseFormData,
	CourseFormViewMode,
	CourseReview,
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
    public canEditForm = true;

    public viewModes = CourseFormViewMode;
    public controlsType: WrapperType = 'edit'

    @Input() public set formData(data: CourseReview | EmptyCourseFormData | null) {
        if (data === null) {
            return;
        }
        if (!isEmptyCourseFormData(data)) {
            const formData = convertCourseToCourseFormData(data);
            this.setCourseModel(formData);
        }
        this.formChanged.emit(this.courseForm);
    }

    @Input() public set viewData(value: CourseBuilderViewData | null) {
        if (value === null) {
            return;
        }
        const { metadata, mode, viewPath } = value;
        this.formMode = mode;
        if (mode === CourseFormViewMode.Review) {
            this.canEditForm = false;
            this.controlsType = 'review';
        }
        this.viewType = viewPath.type;
        this.overallInfoSubform.controls.id.setValue(metadata.secondaryId);
        this.activeFormGroup = this.getFormGroup(viewPath)
    }

	@Output() public createReviewVersion = new EventEmitter<{
        isMaster: boolean;
        formData: CourseFormData;
    }>();
	@Output() public update = new EventEmitter<CourseFormData>();
	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter<{ overallComments: string; modules: string }>();
	@Output() public formChanged = new EventEmitter<typeof this.courseForm>();

	constructor(private configService: ConfigService, 
        private fbHelper: FormBuilderHelper) {
		this.courseForm = this.fbHelper.getNewCourseFormModel();
	}

	public ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			console.log('111 main course form', res);
            this.formChanged.emit(this.courseForm);
		});
	}

    public addModule() {
        const emptyModuleForm = this.fbHelper.getModuleForm();
        this.courseForm.controls.modules.push(emptyModuleForm);
        console.log(this.modulesFormArray.value);
    }

    public addTopic(moduleForm: typeof this.modulesFormArray.controls[0]) {
        const emptyTopicForm = this.fbHelper.getTopicForm();
        const topicsArray = moduleForm.controls.topics;
        topicsArray.push(emptyTopicForm)
        moduleForm.controls.topics = topicsArray;
        console.log(topicsArray, this.modulesFormArray.value);
    }

	public removeModule(id: string): void {
        // IMPLEMENT
		// this.modulesFormArray.removeAt(index...);
	}

	public onSubmit(action: CourseFormViewMode | 'publish'): void {
		const { valid: isValid } = this.courseForm;
        const { value } = this.courseForm;

		switch (action) {
			case 'create': {
                if (isValid) {
                    this.onCreateReviewVersion(value as unknown as CourseFormData, true)
				} else {
                    console.warn('Invalid form data.');
                }
				break;
			}
			case 'edit': {
				if (isValid) {
					this.onCreateReviewVersion(value as unknown as CourseFormData, false)
				}
				break;
			}
            case 'review': {
                this.onSaveReview();
                break;
			}
            case 'publish': {
                this.publish.emit(value as unknown as CourseFormData)
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

    private onSaveReview() {
        const comments: { overallComments: string; modules: string } = {
            overallComments: stringify(this.overallInfoSubform.value.comments),
            modules: stringify(this.modulesFormArray.value),
        }
        this.saveReview.emit(comments);
    }

    private setCourseModel(courseData: CourseFormData): void {
        this.fbHelper.fillCourseModel(this.courseForm, courseData)
	}
}
