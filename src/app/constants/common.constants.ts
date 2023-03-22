import { CourseFormData, CourseReview } from "../typings/course.types";

export interface EmptyCourseFormData {
    isEmpty: boolean;
    uuid: string;
};
export type EmptyCourseFormDataType = typeof EMPTY_COURSE_FORM_DATA;
export const EMPTY_COURSE_FORM_DATA = 'EmptyCourse' as const;

export const isEmptyCourseFormData = (value: CourseReview | EmptyCourseFormData): boolean => {
    return 'isEmpty' in value && value.isEmpty === true;
}

export const getEmptyCourseFormData = (uuid: string): EmptyCourseFormData => {
    return {
        isEmpty: true,
        uuid,
    }
}

export const AppName = 'NovaLearn'