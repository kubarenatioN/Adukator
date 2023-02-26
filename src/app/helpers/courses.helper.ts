import { Course, CourseEditorComments, CourseFormData, CourseModule, CourseReview } from "../typings/course.types";

export const stringify = (data: any): string => {
    if (!data) {
        return ''
    }
    return JSON.stringify(data)
}

export const parseModules = (modulesString: string): CourseModule[] => {
    const modules = JSON.parse(modulesString);
    if (modules === null) {
        return []
    }
    return modules
}

export const parseEditorComments = (commentsString: string): CourseEditorComments | null => {
    const comments = JSON.parse(commentsString);
    if (comments === null) {
        return null
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

export const getEmptyEditorComments = () => {
    return {
        title: null,
        description: null,
        dates: null,
        categories: null,
    }
}