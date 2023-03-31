import {
	Course,
	CourseFormData,
	CourseFormMetadata,
	CourseModule,
	CourseReview,
    ICourseTraining,
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

export const convertCourseToCourseFormData = (
	course: CourseReview
): CourseFormData => {
	const {
		id,
		uuid,
		authorId,
		masterId,
		title,
		description,
		category,
		categoryLabel,
		advantages,
		acquiredCompetencies,
        requiredCompetencies,
		comments,
		modules,
		status,
	} = course;
	const metadata: CourseFormMetadata = {
		id,
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
            acquiredCompetencies,
            requiredCompetencies,
			advantages,
			comments: comments ? JSON.parse(comments) : null,
		},
		modules,
		metadata,
	};
};

export const convertCourseFormDataToCourseReview = (
	formData: CourseFormData
): CourseReview => {
	const { overallInfo, modules, metadata } = formData;
	const { title, description, category, acquiredCompetencies, requiredCompetencies, advantages, comments } = overallInfo;
	const {
		id,
		uuid,
		masterCourseId: masterId,
		authorId,
		status,
	} = metadata;
	return {
		id,
		uuid,
		masterId,
		authorId,
		title,
		description,
		category,
        acquiredCompetencies,
        requiredCompetencies,
		advantages,
		comments: stringify(comments),
		modules,
		status,
	};
};

export const convertCourseFormDataToCourse = (
	formData: CourseFormData
): Course => {
	const { overallInfo, modules, metadata } = formData;
	const { title, description, category, acquiredCompetencies, requiredCompetencies, advantages } = overallInfo;
	const { id, uuid, authorId } = metadata;
	return {
		id,
		uuid,
		title,
		description,
		category,
        acquiredCompetencies,
        requiredCompetencies,
		advantages,
		modules,
		authorId,
	};
};

export const convertCourseToCourseTraining = (
	course: Course
): ICourseTraining => {
	const { id, uuid, title, description, category, acquiredCompetencies, requiredCompetencies, advantages, modules, authorId } =
		course;
	return {
		id,
        uuid,
		title,
		description,
		category,
		advantages,
        acquiredCompetencies,
        requiredCompetencies,
		modules,
		authorId,
	};
};

export const generateUUID = (): string => {
    return nanoid()
};
