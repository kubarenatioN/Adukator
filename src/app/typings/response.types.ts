import { CourseEnrollAction } from "./course.types";
import { CloudinaryFile } from "./files.types";

export interface CoursesResponse<T> {
    data: T
}

export interface DataResponse<T> {
    data: T;
    message?: string
}

export interface CourseEnrollResponseData {
    userId?: number;
    courseId?: number;
    id?: number;
    status: string
}

export interface CourseEnrollResponse {
    data: CourseEnrollResponseData[];
    message: string;
    action: CourseEnrollAction
}

export interface CourseFilesResponse {
    resources: CloudinaryFile[],
    total_count: number
}