import {
	Course,
	CourseFormData,
	CourseFormMetadata,
	CourseModule,
	CourseReview,
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
		authorId,
	};
};

export const convertCourseToCourseTraining = (
	course: Course
): Course => {
	const { _id, uuid, title, description, category, competencies, advantages, modules, authorId } =
		course;
	return {
		_id,
		uuid,
		title,
		description,
		category,
		advantages,
		competencies,
		modules,
		authorId,
	};
};

export const generateUUID = (): string => {
    return nanoid()
};
