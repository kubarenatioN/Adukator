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

export interface Course {
	id: number;
    title: string;
	description: string;
	startTime: string;
	endTime: string;
	category: string;
	subcategory: string;
	advantages?: string;
    modulesJson: string;
    authorId: number;
    createdAt?: string;
}

export interface CourseFormData {
    title: string;
	description: string;
	startTime: string;
	endTime: string;
	category: string;
	subcategory: string;
	advantages?: string;
	modules: CourseModule[];
	userCategory?: string;
	userSubcategory?: string;
}

export interface CoursesResponse {
    published?: Course[]
    review?: Course[]
}