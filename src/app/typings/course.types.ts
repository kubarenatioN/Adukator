import { FormGroup } from "@angular/forms";
import { CourseReviewControlComment } from "./course-review.types";
import { User } from "./user.types";

export enum CourseTopFormGroups {
    OverallInfo = 'overallInfo',
    Modules = 'modules',
}

export enum OverallFormFields {
    Title = 'title',
    Descr = 'description',
    Category = 'category',
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
    comment?: string
    comments: Record<string, string>;
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
    }
    comments: Record<string, string>;
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
    comments: Record<string, string>;
}
 
interface CourseCore {
    title: string;
	description: string;
	category: string;
    advantages?: string;
    authorId: number;
	categoryLabel?: string;
}

// publicly accessed course, used for overview & training
export interface Course extends CourseCore {
    id: number;
    secondaryId: string;
    modulesJson: string;
}

export interface CourseHierarchyComponent {
    courseUUID: string;
    module: number;
    topic?: number;
    task?: number;
}


// 'on review' course raw data
export interface CourseReview extends Course {
    comments: string | null;
    masterId: number | null;
    createdAt?: string;
    status?: CourseReviewStatus;
}

export interface TeacherCourses {
    published?: Course[]
    review?: CourseReview[]
}


export interface StudentCourse extends Course {
    status: string
    active: boolean
}

// data for course form on review
export interface CourseFormData {
    overallInfo: {
        id: string;
        title: string;
        description: string;
        category: string;
        categoryLabel?: string;
        advantages?: string;
        comments: {
            [key: string]: CourseReviewControlComment[] | null
        }
    },
	modules: CourseModule[];
    createdAt?: string;
    metadata: CourseFormMetadata
}

export interface CourseTraining extends CourseCore {
    id: number;
    modules: CourseModule[];
}

export interface CourseFormMetadata {
    id: number;
    secondaryId: string;
    authorId: number;
    masterCourseId: number | null;
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
    module?: number
    topic?: number
};
export interface CourseBuilderViewData {
    metadata: CourseFormMetadata
    mode: CourseFormViewMode
    viewPath: CourseBuilderViewPath
}

export type WrapperType = 'edit' | 'review';

export type CourseEnrollAction = 
    'enroll' | 
    'approve' | 
    'reject' | 
    'cancel' | 
    'leave' | 
    'lookup'

export interface CourseMembers {
    pending: User[];
    approved: User[];
    rejected: User[];
}

export type CourseMemberStatus = 'Pending' | 'Approved' | 'Rejected'

export const CourseMembersMap: {
    [key: string]: CourseMemberStatus;
} = {
    pending: 'Pending', 
    approved: 'Approved', 
    rejected: 'Rejected', 
}

export interface GetCourseMembersParams {
    type: 'list' | 'search',
    status: string,
    size: number,
    page: number,
    courseId: number,
}