import { FormArray, FormGroup } from '@angular/forms';
import {
	Course,
	CourseTraining,
} from '../typings/course.types';

export class UploadHelper {
	private static coursesUploadRootFolder = 'courses';

	public static getTopicUploadFolderFromCourse(
		course: CourseTraining,
		lastId: string
	): string {
		const idsChain = this.prepareIdsChainFromCourse(course, lastId);
		return this.constructCourseEntityFolderPath(idsChain);
	}

	public static getTaskUploadFolder(form: FormGroup): string {
		const idsChain = this.prepareIdsChainFromForm(form);
		return this.constructCourseEntityFolderPath(idsChain);
	}

	public static getTopicUploadFolder(form: FormGroup): string {
		const idsChain = this.prepareIdsChainFromForm(form);
		return this.constructCourseEntityFolderPath(idsChain);
	}

	private static prepareIdsChainFromCourse(
		course: Course,
		lastId: string
	): string[] {
        const hierarchy = {
            id: course.uuid,
            children: course.modules.map(module => ({
                id: module.id,
                children: module.topics.map(topic => ({
                    id: topic.id,
                    children: topic.practice?.tasks.map(task => ({
                        id: task.id,
                        children: []
                    })) ?? []
                }))
            }))
        }
        const res = this.treeSearch(hierarchy, lastId);
        return res.reverse();
    }

	private static prepareIdsChainFromForm(form: FormGroup): string[] {
		const ids = [];
        let currentForm: FormGroup | FormArray | null = form;
		while (currentForm.parent !== null) {
			if (currentForm.value.id != null) {
				ids.push(currentForm.value.id);
			}
			currentForm = currentForm.parent;
		}
		return [...ids, currentForm.value.overallInfo.id].reverse();
	}

	private static constructCourseEntityFolderPath(idsChain: string[]) {
		const folders = ['courses', 'modules', 'topics', 'tasks'];
		const resultChain = [];
		for (let i = 0; i < idsChain.length; i++) {
			resultChain.push(folders[i], idsChain[i]);
		}
		return resultChain.join('/');
	}

    private static treeSearch(root: { id: string, children: any[] }, searchId: string): string[] {
        let res: string[] = []
        if (root.id === searchId) {
			res.push(searchId);
		} else if (root.children.length > 0) {
            let result = [];
            const { children } = root;
            for (let i = 0; i < children.length; i++) {
				result = this.treeSearch(children[i], searchId);                
                if (result.length > 0) {
                    res = [...result, root.id];
                    break;
                }
			}
			return res;
		}

		return res;
    }
}
