import { CourseHierarchyComponent } from "../typings/course.types";

export class UploadHelper {
    private static coursesUploadRootFolder = 'courses';

    public static getTaskUploadFolder(hierarchy: CourseHierarchyComponent): string {
        const { courseUUID, module, topic, task } = hierarchy;
        return [
            this.coursesUploadRootFolder,
            `course-${courseUUID}`,
            `module-${module}`,
            `topic-${topic}`,
            `task-${task}`,
        ].join('/')
    }

    public static getTopicUploadFolder(hierarchy: CourseHierarchyComponent): string {
        const { courseUUID, module, topic } = hierarchy;
        return [
            this.coursesUploadRootFolder,
            `course-${courseUUID}`,
            `module-${module}`,
            `topic-${topic}`,
        ].join('/')
    }
}