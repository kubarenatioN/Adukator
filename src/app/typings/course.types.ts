import { User } from "./user.types";

export interface CourseTopicTask {
    id: string;
    topicId: string;
    moduleId: string;
    courseId: string;
    task: string;
    points: number;
    difficulty: number;
}

// TODO: check fields optionality
export interface CourseTopic {
    // id: string;
    title: string;
    description: string;
    resources?: string[];
    theory?: string;
    practice?: {
        description: string;
        tasks: CourseTopicTask[]
    },
    results?: {
        test: string;
        report: boolean;
        offline: boolean;
    }
}

export interface CourseModule {
	// id: string;
	title: string;
	description: string;
    topics: CourseTopic[]
}

export interface CourseEditorComments {
    title: string;
    description: string;
    categories: string;
    dates: string;
    modules: {
        title: string;
        description: string;
        topics: {
            title: string;
            description?: string;    
        }[]
    }[]
}

 
interface CourseCore {
    title: string;
	description: string;
	startDate: string;
	endDate: string;
	category: string;
    advantages?: string;
    authorId: number;
	categoryLabel?: string;
}

// publicly accessed course, used for overview & training
export interface Course extends CourseCore {
    id: number;
    modulesJson: string;
}


// 'on review' course raw data
export interface CourseReview extends Course {
    editorCommentsJson: string | null;
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

// data for course on review
export interface CourseFormData {
    title: string;
	description: string;
	startDate: string;
	endDate: string;
	category: string;
	categoryLabel?: string;
    advantages?: string;
	modules: CourseModule[];
    editorComments: CourseEditorComments | null;
    createdAt?: string;
    metadata: CourseFormMetadata
}

export interface CourseTraining extends CourseCore {
    id: number;
    modules: CourseModule[];
}

export interface CourseFormMetadata {
    id: number;
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
    Default = 'default',
};

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