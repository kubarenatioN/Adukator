import { CourseEditorComments, CourseFormData, CourseFormMetadata, CourseModule, CourseReview } from "../typings/course.types";

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
    const { id, authorId, masterId, title, description, startTime, endTime, category, subcategory, advantages, modulesJson, editorCommentsJson, status } = course
    const metadata: CourseFormMetadata = {
        id,
        authorId,
        masterCourseId: masterId,
        status
    }
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
        editorComments: editorCommentsJson === null ? editorCommentsJson : parseEditorComments(editorCommentsJson),
        metadata,
    }
}

export const convertCourseFormDataToCourseReview = (formData: CourseFormData): CourseReview => {
    const { title, description, startTime, endTime, category, subcategory, advantages, modules, editorComments, metadata } = formData
    const { masterCourseId: masterId, authorId, status, id } = metadata;
    return {
        id,
        masterId,
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