import { FormGroup } from '@angular/forms';
import {
	Course,
	CourseFormData,
	CourseFormMetadata,
	CourseFormModule,
	CourseModule,
	CourseReview,
	ModuleTopic,
} from '../typings/course.types';
import { nanoid } from 'nanoid';

export const stringify = (data: any): string => {
	if (!data) {
		return '';
	}
	return JSON.stringify(data);
};

export const parseModules = (modulesString: string): CourseModule[] => {
	const modules = JSON.parse(modulesString);
	if (modules === null) {
		return [];
	}
	return modules;
};

export const convertCourseReviewToCourseFormData = (
	course: CourseReview
): CourseFormData => {
	const {
		_id,
		uuid,
		authorId,
		masterId,
		title,
		description,
		category,
		categoryLabel,
		competencies,
		comments,
		modules,
		status,
	} = course;
	const metadata: CourseFormMetadata = {
		_id,
		uuid,
		authorId,
		masterCourseId: masterId,
		status,
	};

	return {
		overallInfo: {
			id: uuid,
			title,
			description,
			category,
			categoryLabel,
			acquiredCompetencies: competencies.acquired,
			requiredCompetencies: competencies.required,
			comments,
		},
		modules,
		metadata,
	};
};

export const convertCourseFormDataToCourseReview = (
	formData: CourseFormData
): CourseReview => {
	const { overallInfo, modules, metadata } = formData;
	const { title, description, category, comments, acquiredCompetencies, requiredCompetencies } = overallInfo;
	const {
		_id,
		uuid,
		masterCourseId: masterId,
		authorId,
		status,
	} = metadata;
	return {
        _id,
		uuid,
		masterId,
		authorId,
		title,
		description,
		category,
        competencies: {
					acquired: acquiredCompetencies,
					required: requiredCompetencies,
        },
		comments,
		modules,
		status,
	};
};

export const convertCourseFormDataToCourse = (
	formData: CourseFormData
): Course => {
	const { overallInfo, modules, metadata } = formData;
	const { title, description, category, acquiredCompetencies, requiredCompetencies } = overallInfo;
	const { uuid, authorId, _id } = metadata;
	return {
		_id: _id ?? '',
		uuid,
		title,
		description,
		category,
        competencies: {
            acquired: acquiredCompetencies,
            required: requiredCompetencies,
        },
		modules,
		topics: modules.reduce((topics, module) => [...topics, ...module.topics], [] as ModuleTopic[]),
		authorId,
	};
};

export const generateUUID = (): string => {
    return nanoid()
};

export const constructCourseTree = (form: FormGroup) => {
	const modules = form.get('modules')?.value as CourseFormModule[]
	const topics = form.get('topics')?.value as ModuleTopic[]
	const tree = modules.map(module => {
			const moduleTopics = topics.filter(topic => topic.moduleId === module.id)
			module.topics = moduleTopics
			return module
	})

	return tree;
}

export const removeComments = <T>(course: Record<string, any>): T => {
	const stack = [course];
  while (stack?.length > 0) {
    const currentObj = stack.pop()!;
    Object.keys(currentObj).forEach(key => {
      if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
				if (key === 'comments') {
					delete currentObj[key]
				} else {
					stack.push(currentObj[key]);
				}
      }
    });
  }

	return course as T
}
