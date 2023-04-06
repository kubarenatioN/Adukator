import { Course, CourseMembershipAction, CourseReview } from "./course.types";
import { CloudinaryFile } from "./files.types";

export interface CoursesResponse<T> {
    data: T
}

export interface DataResponse<T> {
    data: T;
    message?: string
}

export interface CoursesSelectResponse {
    published: Course[]
    review: CourseReview[]
}

export interface CourseReviewHistory {
    versions: CourseReview[]
}

export interface CourseEnrollResponseData {
    _id: string;
    userId?: number;
    courseId?: number;
    status: string
}

export interface CourseEnrollResponse {
    data: CourseEnrollResponseData[];
    message: string;
    action: CourseMembershipAction
}

export interface CourseFilesResponse {
    resources: CloudinaryFile[],
    total_count: number
}