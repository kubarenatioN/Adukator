import { Course, CourseEditorComments, CourseFormData, CourseFormMetadata, CourseModule, CourseReview } from "../typings/course.types";

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
    const { id, authorId, masterId, title, description, startDate, endDate, category, categoryLabel, subcategory, advantages, modulesJson, editorCommentsJson, status } = course
    const metadata: CourseFormMetadata = {
        id,
        authorId,
        masterCourseId: masterId,
        status
    }
    return {
        title,
        description,
        startDate,
        endDate,
        category,
        categoryLabel,
        subcategory,
        advantages,
        modules: parseModules(modulesJson),
        editorComments: editorCommentsJson === null ? editorCommentsJson : parseEditorComments(editorCommentsJson),
        metadata,
    }
}

export const convertCourseFormDataToCourseReview = (formData: CourseFormData): CourseReview => {
    const { title, description, startDate, endDate, category, subcategory, advantages, modules, editorComments, metadata } = formData
    const { id, masterCourseId: masterId, authorId, status } = metadata;
    return {
        id,
        masterId,
        authorId,
        title,
        description,
        startDate,
        endDate,
        category,
        subcategory,
        advantages,
        modulesJson: stringify(modules),
        editorCommentsJson: editorComments ? stringify(editorComments) : null,
        status,
    }
}

export const convertCourseFormDataToCourse = (formData: CourseFormData): Course => {
    const { title, description, startDate, endDate, category, subcategory, advantages, modules, metadata } = formData
    const { id, authorId } = metadata;
    return {
        id,
        title,
        description,
        startDate,
        endDate,
        category,
        subcategory,
        advantages,
        modulesJson: stringify(modules),
        authorId,
    }
}

export const getCategory = (categories: {key: string; name: string}[], key: string): string | null  => {
    return categories.find(c => c.key === key)?.name ?? null 
}