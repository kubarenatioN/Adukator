import { CourseReviewControlComment } from "./course-review.types";
import { ChipItem } from "../modules/course-builder/controls/chips-control/chips-control.component";

export enum CourseTopFormGroups {
    OverallInfo = 'overallInfo',
    Modules = 'modules',
}

export enum OverallFormFields {
    Title = 'title',
    Descr = 'description',
    Category = 'category',
    AcquiredCompetencies = 'acquiredCompetencies',
    RequiredCompetencies = 'requiredCompetencies',
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
}

export enum PracticeFormFields {
    Goal = 'goal',
}

export enum TaskFormFields {
    TaskDescr = 'taskDescr',
    Materials = 'materials',
    Comment = 'comment',
}

export interface TopicTask {
    id: string;
    taskDescr: string;
    materials?: string[],
    type?: 'personal'
    comment?: string
    comments?: Record<string, string>;
}

export interface TopicPractice {
    goal: string;
    tasks: TopicTask[]
}

// TODO: check fields optionality
export interface ModuleTopic {
    id: string;
    title: string;
    description: string;
    materials: string[];
    theory?: string;
    practice?: TopicPractice,
    testLink: string;
    results?: {
        test: string;
        report: boolean;
        offline: boolean;
    };
    startDate: string;
    endDate: string;
    comments: Record<string, string>; // move this review-related field in separate interface
    isActual?: boolean;
    isPast?: boolean;
}

export interface CourseModule {
    id: string;
	title: string;
	description: string;
    topics: ModuleTopic[];
    comments: Record<string, string>;
}

export interface CourseFormOverallInfo {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryLabel?: string;
    comments: Record<string, CourseReviewControlComment[] | null>;
    acquiredCompetencies: string[],
    requiredCompetencies: string[],
}
 
interface CourseCore {
    title: string;
	description: string;
	category: string;
    advantages?: string;
    authorId: string;
	categoryLabel?: string;
}

// publicly accessed course, used for overview & training
export interface Course extends CourseCore {
    _id: string;
    uuid: string;
    modules: CourseModule[];
    competencies: {
        acquired: string[],
        required: string[],
    },
}

export interface CourseHierarchyComponent {
    courseUUID: string;
    module: number;
    topic?: number;
    task?: number;
}


// 'on review' course raw data
export interface CourseReview extends CourseCore {
    _id?: string;
    uuid: string;
    modules: CourseModule[];
    masterId: string | null;
    createdAt?: string;
    status?: CourseReviewStatus;
    competencies: {
        acquired: string[],
        required: string[],
    },
    comments: {
        [key: string]: CourseReviewControlComment[] | null
    }
}

export interface CourseCompetency {
    id: string,
    label: string
}

export interface TeacherCourses {
    published?: Course[]
    review?: CourseReview[]
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
    },
}

// data for course form on review
export interface CourseFormData {
    overallInfo: CourseFormOverallInfo,
	modules: CourseModule[];
    createdAt?: string;
    metadata: CourseFormMetadata
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
    Reviewed = 'Reviewed'
}

export const CourseReviewStatusMap = {
    [CourseReviewStatus.ReadyForReview]: 'Ожидает проверки',
    [CourseReviewStatus.ReadyForUpdate]: 'Ожидает исправлений',
    [CourseReviewStatus.Reviewed]: 'Проверено'
}

export enum CourseFormViewMode {
    Create = 'create',
    Update = 'update',
    Edit = 'edit',
    Review = 'review',
};

export type CourseBuilderViewType =  'topic' | 'module' | 'main'
export interface CourseBuilderViewPath {
    type: CourseBuilderViewType
    module?: string
    topic?: string
};
export interface CourseBuilderViewData {
    metadata: CourseFormMetadata
    mode: CourseFormViewMode
    viewPath: CourseBuilderViewPath
}

export type WrapperType = 'edit' | 'review';

export interface CourseBundle {
    _id: string,
    uuid: string,
    title: string,
    description: string,
    courses: Course[]
}

export interface CourseBundleCreatePayload { 
    title: string, 
    description: string, 
    courses: string[],
    authorId: string,
}