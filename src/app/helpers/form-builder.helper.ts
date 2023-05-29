import { Injectable } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { CourseFormDataMock } from '../mocks/course-form-data';
import {
	CourseFormData,
	CourseFormModule,
	CourseTopFormGroups,
	ModuleFormFields,
	ModuleTopic,
	OverallFormFields,
	PracticeFormFields,
	TaskFormFields,
	TopicFormFields,
	TopicPractice,
	TopicTask,
} from '../typings/course.types';
import {
	ProfileProgressRecord,
	TrainingTaskAnswer,
} from '../typings/training.types';
import { generateUUID } from './courses.helper';
import { CourseReviewControlComment } from '../typings/course-review.types';
import { ChipsValidator } from './course-validation';

@Injectable({
	providedIn: 'root',
})
export class FormBuilderHelper {
	public get fbRef() {
		return this.fb;
	}

	constructor(private fb: FormBuilder) {}

	public getNewCourseFormModel(courseId: string) {
		return this.fb.group({
			[CourseTopFormGroups.OverallInfo]:
				this.getOverallInfoForm(courseId),
			[CourseTopFormGroups.Modules]: this.getCourseModulesFormArray(),
		});
	}

	public fillCourseModel(modelRef: FormGroup, data: CourseFormData) {
		const { overallInfo, modules } = data;
		const modulesArray = this.getCourseModulesFormArray(modules);

		modelRef.patchValue({
			overallInfo,
		});
		modelRef.setControl('modules', modulesArray);
	}

	public getModuleForm(module: CourseFormModule | null = null) {
		const id = module ? module.id : generateUUID();
		return this.fb.group({
			id,
			[ModuleFormFields.Title]: module ? module.title : 'Новый модуль',
			[ModuleFormFields.Descr]: module
				? module.description
				: 'Описание модуля...',
			topics: module
				? this.getTopicsFormArray(module)
				: this.fb.array([this.getTopicForm(id)]),
			comments: this.getFormGroupComments(
				ModuleFormFields,
				module?.comments ?? {}
			),
		});
	}

	public getTopicForm(
		parentModuleId: string | null,
		topic: ModuleTopic | null = null
	) {
		if (!parentModuleId) {
			throw new Error('No topic parent module id provided.');
		}
		return this.fb.group({
			id: topic ? topic.id : generateUUID(),
			moduleId: parentModuleId,
			[TopicFormFields.Title]: topic ? topic.title : 'Новая тема',
			[TopicFormFields.Descr]: topic ? topic.description : '',
			[TopicFormFields.Materials]: topic ? [topic.materials] : [[]],
			[TopicFormFields.Theory]: topic ? topic.theory : null,
			practice: topic?.practice
				? this.getTopicPracticeForm(topic.practice)
				: null,
			[TopicFormFields.TestLink]: topic ? topic.testLink : null,
			[TopicFormFields.Duration]: topic ? topic.duration : null,
			days: topic ? topic.days : 0,
			weeks: topic ? topic.weeks : null,
			comments: this.getFormGroupComments(
				TopicFormFields,
				topic?.comments ?? {}
			),
		});
	}

	public getTopicPracticeForm(practice: TopicPractice | null = null) {
		const tasks = practice
			? this.getTopicTasksFormArray(practice.tasks)
			: this.fb.array([this.getTopicTaskForm()]);
		return this.fb.group({
			[PracticeFormFields.Goal]: practice
				? practice.goal
				: 'Цель практической работы - изучить принципы ООП и научиться их применять.',
			tasks,
		});
	}

	public getTopicTaskForm(task: TopicTask | null = null) {
		return this.fb.group({
			id: task ? task.id : generateUUID(),
			[TaskFormFields.TaskDescr]: task ? task.taskDescr : '',
			[TaskFormFields.Materials]: task ? [task.materials] : [[]],
			comments: this.getFormGroupComments(
				TaskFormFields,
				task?.comments ? task.comments : {}
			),
		});
	}

	public getTrainingTaskForm(task: TopicTask | null = null) {
		return this.fb.group({
			id: task ? task.id : '',
			files: [[] as string[]],
			comment: '',
		});
	}

	public getTrainingTaskInitialValue(id: string): TrainingTaskAnswer {
		return {
			taskId: id,
			files: [],
			comment: '',
		};
	}

	public getTaskResultsCheckForm(
		taskCheck: ProfileProgressRecord | null = null
	) {
		return this.fb.group({
			mark: taskCheck?.mark ?? 0,
			isCounted: taskCheck?.isCounted ?? false,
			comment: taskCheck?.comment,
		});
	}

	private getOverallInfoForm(courseId: string) {
		return this.fb.group({
			id: courseId,
			[OverallFormFields.Title]: [
				CourseFormDataMock.title,
				Validators.required,
			],
			[OverallFormFields.Descr]: [
				CourseFormDataMock.descr,
				Validators.required,
			],
			[OverallFormFields.Category]: ['', Validators.required],
			[OverallFormFields.RequiredCompetencies]: [],
			[OverallFormFields.AcquiredCompetencies]: [
				[], ChipsValidator.minLength(1)
			],
			[OverallFormFields.Banner]: ['', Validators.required],
			comments: this.getFormGroupComments(OverallFormFields, {}),
		});
	}

	private getCourseModulesFormArray(
		modules: CourseFormModule[] | null = null
	) {
		if (modules === null || modules.length === 0) {
			const primaryModuleForm = this.getModuleForm();
			return this.fb.array([primaryModuleForm]);
		}
		const modulesArr = modules.map((module) => {
			return this.getModuleForm(module);
		});

		return this.fb.array(modulesArr);
	}

	private getTopicsFormArray(module: CourseFormModule) {
		return this.fb.array(
			module.topics.map((topic) => {
				return this.getTopicForm(module.id, topic);
			})
		);
	}

	private getTopicTasksFormArray(tasks: TopicTask[]) {
		const arr = this.fb.array<FormGroup>([]);
		tasks.forEach((task) => {
			arr.push(this.getTopicTaskForm(task));
		});
		return arr;
	}

	private getFormGroupComments(
		fields: Record<string, string>,
		reviewComments: Record<string, CourseReviewControlComment[] | null>
	) {
		const commentsObj: Record<string, [CourseReviewControlComment[]] | null> = {};
		Object.values(fields).forEach((key: string) => {
			const comments = reviewComments[key]
			commentsObj[key] = comments && comments.length > 0 ? [comments] : null
		});
		
		return this.fb.group(commentsObj);
	}

	public createAssignTaskForm() {
		return this.fb.group({
			training: '',
			topic: '',
			personalizations: this.fb.array<FormGroup>([]),
			task: '',
		});
	}

	public createDismissTaskForm() {
		return this.fb.group({
			training: '',
			profiles: [new Array<string>()],
			tasks: [new Array<string>()],
		});
	}

	public createOpenTaskForm() {
		return this.fb.group({
			training: '',
			profile: '',
			task: '',
		});
	}
}
