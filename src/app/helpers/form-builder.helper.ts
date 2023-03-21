import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LearnModule } from '../modules/learn/learn.module';
import { CourseEditorComments, CourseModule, ModuleTopic, TopicPractice, TopicTask } from '../typings/course.types';

@Injectable({
	providedIn: 'root',
})
export class FormBuilderHelper {
    public get fbRef() {
        return this.fb;
    }
	constructor(private fb: FormBuilder) {}

	public getEmptyModule(): FormGroup {
		return this.fb.group({
			title: ['Module Title 1', Validators.required],
			description: ['Module descr...', Validators.required],
			topics: this.fb.array([
				this.getEmptyTopic()
			]),
		});
	}

    public getEmptyTopic() {
        return this.fb.group({
            title: ['Topic Title 1', Validators.required],
            description: 'Topic descr...',
            materials: [],
            theory: null,
            testLink: null,
            practice: this.getTopicPractice(null)
        });
    }

    public getTopicPractice(practice: TopicPractice | null) {
        console.log(practice);
        const tasks = this.getTopicTasksFormArray(practice?.tasks ?? [this.getEmptyTopicTask()]);
        return this.fb.group({
            goal: practice ? practice.goal : 'Цель практической работы - изучить принципы ООП и научиться их применять.',
            tasks,
        })
    }

    private getTopicTasksFormArray(tasks: TopicTask[]) {
        const arr = this.fb.array<FormGroup>([])
        tasks.forEach(task => {
            arr.push(this.getTopicTask(task))
        })
        console.log(tasks);
        
        return arr;
    }

    public getTopicTask(task: TopicTask | null = null) {
        return this.fb.group({
            taskDescr: task ? task.taskDescr : 'Создать 5 классов с демонстрацией принципов ООП',
            materials: task ? task.materials : [],
            comment: task ? task.comment : 'Очень важный комментарий от студента Васи Васильевича',
        })
    }

    public getModulesFormArray(modulesData: CourseModule[]): FormArray {
		const array = this.fb.array<FormGroup>([]);
		modulesData.forEach((module) => {
			const topics = this.getTopicsFormArray(module.topics);
			const moduleGroup = this.fb.group({
				title: module.title,
				description: module.description,
				topics: this.fb.array(topics),
			});
			array.push(moduleGroup);
		});

		return array;
	}

    private getTopicsFormArray(topics: ModuleTopic[]) {
		return topics.map((topic) => {
			return this.fb.group({
				title: topic.title,
				description: topic.description,
                materials: topic.materials,
                theory: topic.theory,
                practice: this.getTopicPractice(topic.practice ?? null),
                testLink: topic.testLink
			});
		});
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

    private getEmptyTopicTask(): TopicTask {
        return {
            taskDescr: '',
            materials: [],
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
}
