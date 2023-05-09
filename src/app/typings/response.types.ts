import { Course, CourseReview } from './course.types';
import { CloudinaryFile, UserFile } from './files.types';
import { TrainingMembershipAction } from './training.types';

export interface CoursesResponse<T> {
	data: T;
}

export interface DataResponse<T> {
	data: T;
	message?: string;
}

export interface CoursesSelectResponse {
	published: Course[];
	review: CourseReview[];
}

export interface CourseReviewHistory {
	versions: CourseReview[];
}

export interface CourseEnrollResponseData {
	_id: string;
	userId?: string;
	courseId?: number;
	status: string;
}

export interface CourseEnrollResponse {
	data: CourseEnrollResponseData[];
	message: string;
	action: TrainingMembershipAction;
}

export interface CourseFilesResponse {
	files: UserFile[];
	total: number;
}

export interface CloudinaryFilesResponse {
	resources: CloudinaryFile[];
	total_count: number;
}
