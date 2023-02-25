import { Course, CourseFormData, CourseModule, CourseReview } from "../typings/course.types";

export const stringifyModules = (modules: CourseModule[]): string => {
    return JSON.stringify(modules)
}

export const parseModules = (modulesString: string): CourseModule[] => {
    const modules = JSON.parse(modulesString);
    if (modules === null) {
        return []
    }
    return modules
}

export const parseEditorComments = (commentsString: string): { [field: string]: string } => {
    const comments = JSON.parse(commentsString);
    if (comments === null) {
        return {}
    }
    return comments
}

export const convertCourseToCourseFormData = (course: CourseReview): CourseFormData => {
    const { id, title, description, startTime, endTime, category, subcategory, advantages, modulesJson, editorCommentsJson, status } = course
    return {
        id,
        title,
        description,
        startTime,
        endTime,
        category,
        subcategory,
        advantages,
        modules: parseModules(modulesJson),
        editorComments: parseEditorComments(editorCommentsJson),
        status,
    }
}