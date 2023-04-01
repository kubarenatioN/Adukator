import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseFormDataMock } from '../mocks/course-form-data';
import { TaskAnswer } from '../typings/course-training.types';
import { CourseFormData, CourseFormOverallInfo, CourseModule, CourseTopFormGroups, ModuleFormFields, ModuleTopic, OverallFormFields, PracticeFormFields, TaskFormFields, TopicFormFields, TopicPractice, TopicTask } from '../typings/course.types';
import { generateUUID } from './courses.helper';

@Injectable({
	providedIn: 'root',
})
export class FormBuilderHelper {    
    public get fbRef() {
        return this.fb;
    }
    
	constructor(private fb: FormBuilder) {}

    public getNewCourseFormModel() {
        return this.fb.group({
            [CourseTopFormGroups.OverallInfo]: this.getOverallInfoForm(),			
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

	public getModuleForm(module: CourseModule | null = null) {
		return this.fb.group({
            id: module ? module.id : generateUUID(),
			[ModuleFormFields.Title]: module ? module.title : 'Новый модуль',
			[ModuleFormFields.Descr]: module ? module.description : 'Описание модуля...',
			topics: module ? this.getTopicsFormArray(module.topics) : this.fb.array([
				this.getTopicForm()
			]),
            comments: this.getFormGroupComments(ModuleFormFields, module?.comments ?? {})
		});
	}

    public getTopicForm(topic: ModuleTopic | null = null) {
        return this.fb.group({
            id: topic ? topic.id : generateUUID(),
            [TopicFormFields.Title]: topic ? topic.title : 'Новая тема',
            [TopicFormFields.Descr]: topic ? topic.description : '',
            [TopicFormFields.Materials]: topic ? [topic.materials] : [[]],
            [TopicFormFields.Theory]: topic ? topic.theory : null,
            practice: topic?.practice ? this.getTopicPracticeForm(topic.practice) : null,
            [TopicFormFields.TestLink]: topic ? topic.testLink : null,
            startDate: topic ? topic.startDate : null,
            endDate: topic ? topic.endDate : null,
            comments: this.getFormGroupComments(TopicFormFields, topic?.comments ?? {})
        });
    }

    public getTopicPracticeForm(practice: TopicPractice | null = null) {
        const tasks = practice ? this.getTopicTasksFormArray(practice.tasks) : this.fb.array([this.getTopicTaskForm()]);
        return this.fb.group({
            [PracticeFormFields.Goal]: practice ? practice.goal : 'Цель практической работы - изучить принципы ООП и научиться их применять.',
            tasks,
        })
    }

    public getTopicTaskForm(task: TopicTask | null = null) {
        return this.fb.group({
            id: task ? task.id : generateUUID(),
            [TaskFormFields.TaskDescr]: task ? task.taskDescr : 'Создать 5 классов с демонстрацией принципов ООП',
            [TaskFormFields.Materials]: task ? task.materials : [],
            [TaskFormFields.Comment]: task ? task.comment : 'Очень важный комментарий от студента Васи Васильевича',
            comments: this.getFormGroupComments(TaskFormFields, task?.comments ?? {}),
        })
    }

    public getTrainingTaskForm() {
        return this.fb.group({
            id: '',
            files: [new Array<string>()],
            comment: ''
        })
    }

    public getTrainingTaskDefaultValue(id: string): TaskAnswer {
        return {
            id,
            files: [],
            comment: ''
        }
    }

    private getOverallInfoForm(overallInfo: CourseFormOverallInfo | null = null) {
        return this.fb.group({
            id: overallInfo ? overallInfo.id : generateUUID(),
            [OverallFormFields.Title]: overallInfo ? overallInfo.title : [CourseFormDataMock.title, Validators.required],
			[OverallFormFields.Descr]: overallInfo ? overallInfo.description : [CourseFormDataMock.descr, Validators.required],
			[OverallFormFields.Category]: overallInfo ? overallInfo.category : '',
			[OverallFormFields.AcquiredCompetencies]: overallInfo ? [overallInfo.acquiredCompetencies] : [[]],
			[OverallFormFields.RequiredCompetencies]: overallInfo ? [overallInfo.requiredCompetencies] : [[]],
            comments: this.getFormGroupComments(OverallFormFields, overallInfo?.comments ?? {})
        })
    }

    private getCourseModulesFormArray(modules: CourseModule[] | null = null) {
        if (modules === null || modules.length === 0) {
            const primaryModuleForm = this.getModuleForm()
            return this.fb.array([primaryModuleForm]);
        }
		const modulesArr = modules.map((module) => {
            return this.getModuleForm(module)
		});

		return this.fb.array(modulesArr);
    }

    private getTopicsFormArray(topics: ModuleTopic[]) {
        return this.fb.array(topics.map((topic) => {
			return this.getTopicForm(topic)
		}));
	}

    private getTopicTasksFormArray(tasks: TopicTask[]) {
        const arr = this.fb.array<FormGroup>([])
        tasks.forEach(task => {
            arr.push(this.getTopicTaskForm(task))
        })
        return arr;
    }

    private getFormGroupComments(fields: Record<string, string>, comments: Record<string, unknown>) {
        const commentsObj: { [key: string]: unknown } = {}
        Object.values(fields).forEach((key: string) => {
            commentsObj[key] = comments[key] ?? null
        });
        return this.fb.group(commentsObj);
    }
}
