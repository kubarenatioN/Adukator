import { CourseFormData } from "../typings/course.types";

export type EmptyCourseFormDataType = typeof EMPTY_COURSE_FORM_DATA;
export const EMPTY_COURSE_FORM_DATA = 'EmptyCourse' as const;

export function isEmptyCourseFormData(value: CourseFormData | EmptyCourseFormDataType): boolean {
    return value === EMPTY_COURSE_FORM_DATA;
}