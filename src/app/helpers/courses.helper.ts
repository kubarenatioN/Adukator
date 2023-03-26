import {
	Course,
	CourseFormData,
	CourseFormMetadata,
	CourseModule,
	CourseReview,
	CourseTraining,
} from '../typings/course.types';
import { v4 as uuidv4 } from 'uuid';

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
		secondaryId,
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
		secondaryId,
		authorId,
		masterCourseId: masterId,
		status,
	};

	return {
		overallInfo: {
			id: secondaryId,
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
		secondaryId,
		masterCourseId: masterId,
		authorId,
		status,
	} = metadata;
	return {
		id,
		secondaryId,
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
	const { id, secondaryId, authorId } = metadata;
	return {
		id,
		secondaryId,
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
): CourseTraining => {
	const { id, secondaryId, title, description, category, acquiredCompetencies, requiredCompetencies, advantages, modules, authorId } =
		course;
	return {
		id,
        secondaryId,
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
	return uuidv4();
};
