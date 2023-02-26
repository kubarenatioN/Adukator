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
    id: number;
    title: string;
	description: string;
	startTime: string;
	endTime: string;
	category: string;
	subcategory: string;
	advantages?: string;
}

export interface Course extends CourseCore {
    modulesJson: string;
    authorId: number;
    createdAt?: string;
}

export interface CourseFormData extends CourseCore {
	userCategory?: string;
	userSubcategory?: string;
    status: string;
	modules: CourseModule[];
    editorComments: CourseEditorComments | null;
}

export interface CourseReview extends Course {
    parentId: number | null;
    status: CourseReviewStatus;
    editorCommentsJson: string;
}

export enum CourseReviewStatus {
    ReadyForReview = 'ReadyForReview',
    ReadyForUpdate = 'ReadyForUpdate',
    Reviewed = 'Reviewed'
}

export const CourseReviewStatusMap = {
    [CourseReviewStatus.ReadyForReview]: 'Ожидает проверки',
    [CourseReviewStatus.ReadyForUpdate]: 'Ожидает исправлений',
    [CourseReviewStatus.Reviewed]: 'Проверено'
}

export interface CoursesResponse {
    published?: Course[]
    review?: CourseReview[]
    // reviewChildren?: Course[]
}

export enum CourseFormViewMode {
    Create = 'create',
    Update = 'update',
    Edit = 'edit',
    Review = 'review',
    Default = 'default',
};