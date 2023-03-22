import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseOverallFormFields } from '../config/course-form.config';
import { CourseFormDataMock } from '../mocks/course-form-data';
import { CourseEditorComments, CourseFormData, CourseModule, CourseTopFormGroups, ModuleTopic, OverallFormFields, TopicPractice, TopicTask } from '../typings/course.types';

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
        const { modules, editorComments } = data;

		const modulesArray = this.getCourseModulesFormArray(modules);
		const editorModulesArray = this.getEditorComments(editorComments, modules);

		modelRef.patchValue({
			title: data.title,
			description: data.description,
			category: data.category,
			editorComments: editorComments ?? this.getEmptyEditorComments(),
		});

        const modulesFormArray = this.getFormModules(modelRef)
        const editorModulesFormArray = this.getFormEditorCommentsModules(modelRef)

		modulesArray.controls.forEach((control) => {
			modulesFormArray.push(control);
		});

		editorModulesArray.forEach((control) => {
			editorModulesFormArray.push(control);
		});
    }

	public getModuleForm(module: CourseModule | null = null) {
		return this.fb.group({
			title: module ? module.title : 'Module Title 1',
			description: module ? module.description : 'Module descr...',
			topics: module ? this.getTopicsFormArray(module.topics) : this.fb.array([
				this.getTopicForm()
			]),
		});
	}

    public getTopicForm(topic: ModuleTopic | null = null) {
        return this.fb.group({
            title: topic ? topic.title : 'Topic Title 1',
            description: topic ? topic.description : 'Topic descr...',
            materials: topic ? topic.materials : [],
            theory: topic ? topic.theory : null,
            testLink: topic ? topic.testLink : null,
            practice: this.getTopicPracticeForm(topic?.practice ?? null)
        });
    }

    public getTopicPracticeForm(practice: TopicPractice | null = null) {
        const tasks = practice ? this.getTopicTasksFormArray(practice.tasks) : this.fb.array([this.getTopicTaskForm()]);
        return this.fb.group({
            goal: practice ? practice.goal : 'Цель практической работы - изучить принципы ООП и научиться их применять.',
            tasks,
        })
    }

    public getTopicTaskForm(task: TopicTask | null = null) {
        return this.fb.group({
            taskDescr: task ? task.taskDescr : 'Создать 5 классов с демонстрацией принципов ООП',
            materials: task ? task.materials : [],
            comment: task ? task.comment : 'Очень важный комментарий от студента Васи Васильевича',
        })
    }

    public getEditorComments(editorComments: CourseEditorComments | null, modules: CourseModule[]) {
		if (editorComments?.modules && editorComments.modules.length > 0) {
			return this.getEditorCommentsModules(editorComments.modules);
		}
        return this.getEditorCommentsModules(modules, { isEmpty: true });
	}

    public getEmptyEditorComments() {
        return {
            title: null,
            description: null,
            dates: null,
            categories: null,
        }
    }

    public getEditorCommentsModules(
		modules: Record<string, any>[],
		{ isEmpty }: { isEmpty: boolean } = { isEmpty: false }
	): FormGroup[] {
		return modules.map((module) => {
			const topics = this.getEditorCommentsModuleTopics(
				module['topics'],
				{ isEmpty }
			);
			return this.fb.group({
				title: isEmpty ? null : module['title'],
				description: isEmpty ? null : module['description'],
				topics: this.fb.array(topics),
			});
		});
	}

    private getOverallInfoForm(overallInfo?: any) {
        console.log(overallInfo);

        return this.fb.group({
            [OverallFormFields.Title]: [CourseFormDataMock.title, Validators.required],
			[OverallFormFields.Descr]: [CourseFormDataMock.descr, Validators.required],
			[OverallFormFields.Category]: [''],
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
		const arr = topics.map((topic) => {
			return this.getTopicForm(topic)
		});
        return this.fb.array(arr);
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

    private getEditorCommentsModuleTopics(
		topics: Record<string, any>[],
		{ isEmpty }: { isEmpty: boolean }
	) {
		return topics.map((topic) => {
			return this.fb.group({
				title: isEmpty ? null : topic['title'],
				description: isEmpty ? null : topic['description'],
			});
		});
	}

    private getFormModules(form: FormGroup): FormArray {
		return form.get('modules') as FormArray;
	}

    private getFormEditorComments(form: FormGroup): FormGroup {
		return form.get('editorComments') as FormGroup;
	}

    private getFormEditorCommentsModules(form: FormGroup): FormArray {
		return this.getFormEditorComments(form).get('modules') as FormArray;
	}
}
