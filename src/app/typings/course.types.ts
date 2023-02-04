export interface CourseTopicTask {
    id: string;
    topicId: string;
    moduleId: string;
    courseId: string;
    task: string;
    points: number;
    difficulty: number;
}

export interface CourseTopic {
    id: string;
    title: string;
    description: string;
    resources: string[];
    theory?: string;
    practice?: {
        description: string;
        tasks: CourseTopicTask[]
    },
    results: {
        test: string;
        report: boolean;
        offline: boolean;
    }
}

export interface CourseModule {
	id: string;
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
	modules: CourseModule[];
}

export interface CreateCourseFormData extends Course {
	userCategory?: string;
	userSubcategory?: string;
}
