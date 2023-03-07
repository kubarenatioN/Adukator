import { CourseEnrollAction } from "./course.types";
import { User } from "./user.types";

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