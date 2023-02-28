import { CourseEditorComments, CourseFormData, CourseModule, CourseReview } from "../typings/course.types";

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

export const getEmptyEditorComments = () => {
    return {
        title: null,
        description: null,
        dates: null,
        categories: null,
    }
}

export const convertCourseToCourseFormData = (course: CourseReview): CourseFormData => {
    const { id, authorId, parentId, title, description, startTime, endTime, category, subcategory, advantages, modulesJson, editorCommentsJson, status } = course
    return {
        id,
        authorId,
        parentId,
        title,
        description,
        startTime,
        endTime,
        category,
        subcategory,
        advantages,
        modules: parseModules(modulesJson),
        editorComments: editorCommentsJson === null ? editorCommentsJson : parseEditorComments(editorCommentsJson),
        status,
    }
}

export const convertCourseFormDataToCourseReview = (formData: CourseFormData): CourseReview => {
    const { id, parentId, title, description, startTime, endTime, category, subcategory, advantages, modules, editorComments, status, authorId } = formData
    return {
        id,
        parentId,
        authorId,
        title,
        description,
        startTime,
        endTime,
        category,
        subcategory,
        advantages,
        modulesJson: stringify(modules),
        editorCommentsJson: stringify(editorComments),
        status,
    }
}