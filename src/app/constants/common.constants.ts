import { CourseReview } from "../typings/course.types";

export interface EmptyCourseFormData {
    isEmpty: boolean;
    uuid: string;
};

export const isEmptyCourseFormData = (value: CourseReview | EmptyCourseFormData): value is EmptyCourseFormData => {
    return 'isEmpty' in value && value.isEmpty === true;
}

export const getEmptyCourseFormData = (uuid: string): EmptyCourseFormData => {
    return {
        isEmpty: true,
        uuid,
    }
}

export const AppName = 'NovaLearn'