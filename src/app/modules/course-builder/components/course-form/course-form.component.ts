import {
    ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DateRange, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { BehaviorSubject, Observable, takeUntil } from 'rxjs';
import {
    EmptyCourseFormData,
	isEmptyCourseFormData,
} from 'src/app/constants/common.constants';
import { convertCourseToCourseFormData } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { getTopicMinDate, getTopicMaxDate } from 'src/app/helpers/forms.helper';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import {
    CourseBuilderViewData,
    CourseBuilderViewPath,
    CourseBuilderViewType,
	CourseFormData,
	CourseFormViewMode,
	CourseReview,
    WrapperType,
} from 'src/app/typings/course.types';
import { CourseBuilderService } from '../../services/course-builder.service';

@Component({
	selector: 'app-course-form',
	templateUrl: './course-form.component.html',
	styleUrls: ['./course-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent extends BaseComponent implements OnInit {
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
    public viewType$ = new BehaviorSubject<CourseBuilderViewType | null>(null);
    // private viewType!: CourseBuilderViewType | 'reset';
    public canEditForm = true;
    public viewData!: CourseBuilderViewData

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

	@Output() public createReviewVersion = new EventEmitter<{
        isMaster: boolean;
        formData: CourseFormData;
    }>();
	@Output() public update = new EventEmitter<CourseFormData>();
	@Output() public publish = new EventEmitter<CourseFormData>();
	@Output() public saveReview = new EventEmitter();
	@Output() public formChanged = new EventEmitter<typeof this.courseForm>();

	constructor(private configService: ConfigService, 
        private fbHelper: FormBuilderHelper,
        private courseBuilderService: CourseBuilderService,
    ) {
        super()
        const courseId = this.courseBuilderService.courseId
		this.courseForm = this.fbHelper.getNewCourseFormModel(courseId);
	}

	public ngOnInit(): void {
		this.courseForm.valueChanges.subscribe((res) => {
			// console.log('111 main course form', res);
            this.formChanged.emit(this.courseForm);
		});

        this.courseBuilderService.viewData$
        .pipe(takeUntil(this.componentLifecycle$))
        .subscribe(viewData => {
            this.viewData = viewData;
            console.log(viewData);
            
            const { metadata, mode, viewPath } = viewData;
            this.formMode = mode;
            if (mode === CourseFormViewMode.Review) {
                this.canEditForm = false;
                this.controlsType = 'review';
            }
            this.viewType$.next(viewPath.type);
            this.overallInfoSubform.controls.id.setValue(metadata.uuid);
            this.activeFormGroup = this.getFormGroup(viewPath)
        })
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

    public getDateInputMin(form: FormGroup): Date | null {
        return getTopicMinDate(this.courseForm, form);
    }

    public getDateInputMax(form: FormGroup): Date | null {
        return getTopicMaxDate(this.courseForm, form);
    }

    private getFormGroup({ type, module, topic}: CourseBuilderViewPath): any {
        try {
            if (module != null && type === 'module') {
                const moduleForm = this.findControlById([...this.courseForm.controls.modules.controls], module);
                if (type === 'module') {
                    return moduleForm;
                }
            }
            else if (topic != null && type === 'topic') {
                const topics: FormGroup[] = []
                this.courseForm.controls.modules.controls.forEach(module => {
                    topics.push(...module.controls.topics.controls)
                })
                return this.findControlById(topics, topic);
            }
            else {
                return this.courseForm.controls.overallInfo
            }
        } catch (error) {
            this.viewType$.next('main');
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
        const comments = {
            overallComments: this.overallInfoSubform.value.comments,
            modules: this.modulesFormArray.value,
        }
        this.saveReview.emit(comments);
    }

    private setCourseModel(courseData: CourseFormData): void {
        this.fbHelper.fillCourseModel(this.courseForm, courseData)
	}

    private findControlById(array: FormGroup[], id: string): FormGroup {
        return array.find(control => control.value.id === id) as FormGroup
    }
}
