import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LearnModule } from '../modules/learn/learn.module';
import { CourseEditorComments, CourseModule, CourseTopic } from '../typings/course.types';

@Injectable({
	providedIn: 'root',
})
export class FormBuilderHelper {
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
            materials: [''],
            theory: null,
            testLink: null,
            practice: null,
        });
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

    private getTopicsFormArray(topics: CourseTopic[]) {
		return topics.map((topic) => {
			return this.fb.group({
				title: topic.title,
				description: topic.description,
                theory: topic.theory,
                practice: 'practice',
                test: topic.results?.test
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
