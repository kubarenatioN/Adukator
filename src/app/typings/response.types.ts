import { User } from "./user.types";

export interface CoursesResponse<T> {
    data: T
}

interface CourseEnrollResponseData {
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

export type CourseEnrollAction = 'enroll' | 'approve' | 'reject' | 'lookup'

export interface CourseMembers {
    pending: User[];
    approved: User[];
    rejected: User[];
}

export interface GetCourseMembersParams {
    type: 'list' | 'search',
    status: string,
    size: number,
    page: number,
    courseId: number,
}