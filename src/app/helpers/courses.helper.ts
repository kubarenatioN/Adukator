import { Course, CourseEditorComments, CourseFormData, CourseFormMetadata, CourseModule, CourseReview, CourseTraining } from "../typings/course.types";

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
    const { id, authorId, masterId, title, description, category, categoryLabel, advantages, modulesJson, editorCommentsJson, status } = course
    const metadata: CourseFormMetadata = {
        id,
        authorId,
        masterCourseId: masterId,
        status
    }
    return {
        title,
        description,
        category,
        categoryLabel,
        advantages,
        modules: parseModules(modulesJson),
        editorComments: editorCommentsJson === null ? editorCommentsJson : parseEditorComments(editorCommentsJson),
        metadata,
    }
}

export const convertCourseFormDataToCourseReview = (formData: CourseFormData): CourseReview => {
    const { title, description, category, advantages, modules, editorComments, metadata } = formData
    const { id, masterCourseId: masterId, authorId, status } = metadata;
    return {
        id,
        masterId,
        authorId,
        title,
        description,
        category,
        advantages,
        modulesJson: stringify(modules),
        editorCommentsJson: editorComments ? stringify(editorComments) : null,
        status,
    }
}

export const convertCourseFormDataToCourse = (formData: CourseFormData): Course => {
    const { title, description, category, advantages, modules, metadata } = formData
    const { id, authorId } = metadata;
    return {
        id,
        title,
        description,
        category,
        advantages,
        modulesJson: stringify(modules),
        authorId,
    }
}

export const convertCourseToCourseTraining = (course: Course): CourseTraining => {
    const { id, title, description, category, advantages, modulesJson, authorId } = course
    return {
        id,
        title,
        description,
        category,
        advantages,
        modules: parseModules(modulesJson),
        authorId,
    }
}