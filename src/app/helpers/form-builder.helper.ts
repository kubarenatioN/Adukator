import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseFormDataMock } from '../mocks/course-form-data';
import { CourseFormData, CourseFormOverallInfo, CourseModule, CourseTopFormGroups, ModuleFormFields, ModuleTopic, OverallFormFields, PracticeFormFields, TaskFormFields, TopicFormFields, TopicPractice, TopicTask } from '../typings/course.types';

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
			[ModuleFormFields.Title]: module ? module.title : 'Module Title 1',
			[ModuleFormFields.Descr]: module ? module.description : 'Module descr...',
			topics: module ? this.getTopicsFormArray(module.topics) : this.fb.array([
				this.getTopicForm()
			]),
            comments: this.getFormGroupComments(ModuleFormFields, {})
		});
	}

    public getTopicForm(topic: ModuleTopic | null = null) {
        return this.fb.group({
            [TopicFormFields.Title]: topic ? topic.title : 'Topic Title 1',
            [TopicFormFields.Descr]: topic ? topic.description : 'Topic descr...',
            [TopicFormFields.Materials]: topic ? topic.materials : [],
            [TopicFormFields.Theory]: topic ? topic.theory : null,
            practice: this.getTopicPracticeForm(topic?.practice ?? null),
            [TopicFormFields.TestLink]: topic ? topic.testLink : null,
            comments: this.getFormGroupComments(TopicFormFields, {})
        });
    }

    public getTopicPracticeForm(practice: TopicPractice | null = null) {
        const tasks = practice ? this.getTopicTasksFormArray(practice.tasks) : this.fb.array([this.getTopicTaskForm()]);
        return this.fb.group({
            [PracticeFormFields.Goal]: practice ? practice.goal : 'Цель практической работы - изучить принципы ООП и научиться их применять.',
            tasks,
            comments: this.getFormGroupComments(PracticeFormFields, {}),
        })
    }

    public getTopicTaskForm(task: TopicTask | null = null) {
        return this.fb.group({
            [TaskFormFields.TaskDescr]: task ? task.taskDescr : 'Создать 5 классов с демонстрацией принципов ООП',
            [TaskFormFields.Materials]: task ? task.materials : [],
            [TaskFormFields.Comment]: task ? task.comment : 'Очень важный комментарий от студента Васи Васильевича',
            comments: this.getFormGroupComments(TaskFormFields, {}),
        })
    }

    private getOverallInfoForm(overallInfo: CourseFormOverallInfo | null = null) {
        return this.fb.group({
            [OverallFormFields.Title]: overallInfo ? overallInfo.title : [CourseFormDataMock.title, Validators.required],
			[OverallFormFields.Descr]: overallInfo ? overallInfo.description : [CourseFormDataMock.descr, Validators.required],
			[OverallFormFields.Category]: overallInfo ? overallInfo.category : [''],
            comments: this.getFormGroupComments(OverallFormFields, {})
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