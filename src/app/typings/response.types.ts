export interface CoursesResponse<T> {
    data: T
}

interface CourseEnrollResponseData {
    userId?: number;
    courseId?: number;
    id?: number;
}

export interface CourseEnrollResponse {
    data: CourseEnrollResponseData[];
    message: string;
    action: CourseEnrollAction
}

export type CourseEnrollAction = 'enroll' | 'approve' | 'reject' | 'lookup'