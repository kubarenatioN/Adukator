import { Course, CourseEditorComments, CourseFormData, CourseFormMetadata, CourseModule, CourseReview, CourseTraining } from "../typings/course.types";
import { v4 as uuidv4 } from 'uuid';

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
    const { id, secondaryId, authorId, masterId, title, description, category, categoryLabel, advantages, modulesJson, editorCommentsJson, status } = course
    const metadata: CourseFormMetadata = {
        id,
        secondaryId,
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
    const { id, secondaryId, masterCourseId: masterId, authorId, status } = metadata;
    return {
        id,
        secondaryId,
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
    const { id, secondaryId, authorId } = metadata;
    return {
        id,
        secondaryId,
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

export const generateUUID = (): string => {
    return uuidv4();
}