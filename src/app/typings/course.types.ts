import { CourseReviewControlComment } from './course-review.types';
import { ChipItem } from '../modules/course-builder/controls/chips-control/chips-control.component';
import { Training } from './training.types';
import { User } from './user.types';

export enum CourseTopFormGroups {
	OverallInfo = 'overallInfo',
	Modules = 'modules',
	Topics = 'topics',
}

export enum OverallFormFields {
	Title = 'title',
	Descr = 'description',
	Category = 'category',
	AcquiredCompetencies = 'acquiredCompetencies',
	RequiredCompetencies = 'requiredCompetencies',
	Banner = 'banner',
}

export enum ModuleFormFields {
	Title = 'title',
	Descr = 'description',
}

export enum TopicFormFields {
	Title = 'title',
	Descr = 'description',
	Materials = 'materials',
	Theory = 'theory',
	TestLink = 'testLink',
	Duration = 'duration', //days
}

export enum PracticeFormFields {
	Goal = 'goal',
}

export enum TaskFormFields {
	TaskDescr = 'taskDescr',
	Materials = 'materials',
}

export interface TopicTask {
	id: string;
	taskDescr: string;
	materials?: string[];
	type?: 'personal';
	isOpened?: boolean;
	comments?: Record<string, CourseReviewControlComment[] | null>;
}

export interface TopicPractice {
	goal: string;
	tasks: TopicTask[];
}

// TODO: check fields optionality
export interface ModuleTopic {
	id: string;
	moduleId: string;
	title: string;
	description: string;
	materials: string[];
	theory?: string;
	practice?: TopicPractice;
	testLink?: string;
	results?: {
		test: string;
		report: boolean;
		offline: boolean;
	};
	duration: number; // in days
	startAt: string;
	days?: number;
	weeks?: number;
	comments?: Record<string, CourseReviewControlComment[] | null>;
	isActual?: boolean;
	isPast?: boolean;
}

export interface CourseFormModule {
	id: string;
	title: string;
	description: string;
	topics: ModuleTopic[];
	comments?: Record<string, CourseReviewControlComment[] | null>;
}

export interface CourseModule {
	id: string;
	title: string;
	description: string;
}

export interface CourseFormOverallInfo {
	id: string;
	title: string;
	description: string;
	category: string;
	categoryLabel?: string;
	comments?: Record<string, CourseReviewControlComment[] | null>;
	acquiredCompetencies: {
		id: string,
		label: string,
		category?: string,
	}[];
	requiredCompetencies: {
		id: string,
		label: string,
		category?: string,
	}[];
	banner: string;
}

interface CourseCore {
	uuid: string;
	title: string;
	description: string;
	category: string;
	advantages?: string;
	authorId: string;
	categoryLabel?: string;
}

export interface LearnCatalogCourse extends Course {
	trainings?: Training[]
}

// publicly accessed course, used for overview & training
export interface Course extends CourseCore {
	_id: string;
	modules: CourseModule[];
	topics: ModuleTopic[];
	createdAt?: string;
	training?: Training;
	banner?: string;
	score?: number;
	contentTree?: CourseContentTree;
	rating?: number;
	competencies: {
		acquired: string[];
		required: string[];
	}

	// custom
	status?: 'active' | 'hold';
	trainings?: Training[];
	author?: {
		username: string,
		photo: string
	},
}

export type CourseContentTree = {
	moduleId: string;
	module: CourseModule;
	topics: ModuleTopic[];
}[]

// 'on review' course raw data
export interface CourseReview extends CourseCore {
	_id?: string;
	masterId: string | null;
	createdAt?: string;
	status?: CourseReviewStatus;
	modules: CourseFormModule[];
	banner?: string;
	competencies: {
		acquired: {
			id: string,
			label: string,
			category?: string,
		}[];
		required: {
			id: string,
			label: string,
			category?: string,
		}[];
	};
	comments?: Record<string, CourseReviewControlComment[] | null>;
}

// use type like this to separate review comments from actual course data
// export interface CourseReviewComments {
// 	overallComments: {
// 		[key: string]: CourseReviewControlComment[] | null;
// 	};
// 	modules: {
// 		id: string;
// 		comments: {
// 			[key: string]: CourseReviewControlComment[] | null;
// 		};
// 	}[];
// 	topics: {
// 		id: string;
// 		comments: {
// 			[key: string]: CourseReviewControlComment[] | null;
// 		};
// 	}[];
// 	tasks?: {
// 		id: string;
// 		comments: {
// 			[key: string]: CourseReviewControlComment[] | null;
// 		};
// 	}[];
// }

export interface CourseCompetency {
	id: string;
	label: string;
	category?: string;
}

export interface TeacherCourses {
	published?: Course[];
	review?: CourseReview[];
}

export interface CourseOverallInfo {
	id: string;
	title: string;
	description: string;
	category: string;
	categoryLabel?: string;
	competencies: {
		acquired: string[];
		required: string[];
	};
}

// data for course form on review
export interface CourseFormData {
	overallInfo: CourseFormOverallInfo;
	modules: CourseFormModule[];
	createdAt?: string;
	metadata: CourseFormMetadata;
}

export interface CourseFormMetadata {
	_id?: string;
	uuid: string;
	authorId: string;
	masterCourseId: string | null;
	status?: CourseReviewStatus;
}

export enum CourseReviewStatus {
	Default = 'ReadyForReview',
	ReadyForReview = 'ReadyForReview',
	ReadyForUpdate = 'ReadyForUpdate',
	Reviewed = 'Reviewed',
}

export const CourseReviewStatusMap = {
	[CourseReviewStatus.ReadyForReview]: 'Ожидает проверки',
	[CourseReviewStatus.ReadyForUpdate]: 'Ожидает исправлений',
	[CourseReviewStatus.Reviewed]: 'Проверено',
};

export enum CourseFormViewMode {
	Create = 'create',
	Update = 'update',
	Edit = 'edit',
	Review = 'review',
}

export type CourseBuilderViewType = 'topic' | 'module' | 'main';
export interface CourseBuilderViewPath {
	type: CourseBuilderViewType;
	module?: string;
	topic?: string;
}
export interface CourseBuilderViewData {
	metadata: CourseFormMetadata;
	mode: CourseFormViewMode;
	viewPath: CourseBuilderViewPath;
}

export type WrapperType = 'edit' | 'review';

export interface CourseBundle {
	_id: string;
	uuid: string;
	title: string;
	description: string;
	courses: Partial<Course>[];
}

export interface CourseBundleCreatePayload {
	title: string;
	description: string;
	courses: string[];
	authorId: string;
}

export interface CourseFeedback {
	_id: string
	uuid: string
	text: string
	rating: number
	author: User
	course: Course
	training: Training
	date: string
}