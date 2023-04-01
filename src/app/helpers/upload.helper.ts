import { FormArray, FormGroup } from '@angular/forms';
import { CourseTraining } from '../models/course.model';
import {
	Course,
	ICourseTraining,
} from '../typings/course.types';

export class UploadHelper {
	private static uploadRootFolders = {
        published: 'courses',
        review: 'courses',
        // review: 'courses-review',
        training: 'training',
        users: 'users',
    };

    // Here may be overload in future
	public static getTrainingTaskUploadFolder(from: 'form' | 'course', obj: FormGroup): string;
	public static getTrainingTaskUploadFolder(from: 'form' | 'course', obj: CourseTraining, lastId: string): string;
	public static getTrainingTaskUploadFolder(from: 'form' | 'course', obj: CourseTraining | FormGroup, lastId?: string): string {
		if (from === 'form') {
            return this.getUploadFolderFromForm(obj as FormGroup, this.uploadRootFolders.training);
        }
        else if (from === 'course' && lastId !== undefined) {
            return this.getUploadFolderFromCourse((obj as CourseTraining).course, lastId, this.uploadRootFolders.training);
        }
        return '';
	}

    // Here may be overload in future
	public static getTaskReviewUploadFolder(form: FormGroup): string {
		const idsChain = this.prepareIdsChainFromForm(form);
		return this.constructCourseEntityFolderPath(idsChain, this.uploadRootFolders.review);
	}

    public static getTopicUploadFolder(from: 'form' | 'course', obj: FormGroup): string;
	public static getTopicUploadFolder(from: 'form' | 'course', obj: CourseTraining, lastId: string): string
	public static getTopicUploadFolder(from: 'form' | 'course', obj: CourseTraining | FormGroup, lastId?: string): string {
        if (from === 'form') {
            return this.getUploadFolderFromForm(obj as FormGroup);
        }
        else if (from === 'course' && lastId !== undefined) {
            return this.getUploadFolderFromCourse((obj as CourseTraining).course, lastId);
        }
        return '';
    }

	public static getTopicReviewUploadFolder(from: 'form' | 'course', obj: FormGroup): string;
	public static getTopicReviewUploadFolder(from: 'form' | 'course', obj: ICourseTraining, lastId: string): string
	public static getTopicReviewUploadFolder(from: 'form' | 'course', obj: ICourseTraining | FormGroup, lastId?: string): string {
        if (from === 'form') {
            return this.getUploadFolderFromForm(obj as FormGroup, this.uploadRootFolders.review);
        }
        else if (from === 'course' && lastId !== undefined) {
            return this.getUploadFolderFromCourse(obj as ICourseTraining, lastId, this.uploadRootFolders.review);
        }
        return '';
    }

	private static getUploadFolderFromForm(form: FormGroup, root?: string): string {
		const idsChain = this.prepareIdsChainFromForm(form);
		return this.constructCourseEntityFolderPath(idsChain, root);
	}

    private static getUploadFolderFromCourse(
		course: ICourseTraining,
		lastId: string,
        root?: string
	): string {
		const idsChain = this.prepareIdsChainFromCourse(course, lastId);
		return this.constructCourseEntityFolderPath(idsChain, root);
	}

	private static prepareIdsChainFromCourse(
		course: ICourseTraining,
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

	private static constructCourseEntityFolderPath(idsChain: string[], root: string = this.uploadRootFolders.published) {
        root = 'dev-' + root; // DEV
		const folders = [root, 'modules', 'topics', 'tasks'];
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
