import { Course, CourseFormData, CourseModule } from "../typings/course.types";

export const stringifyModules = (modules: CourseModule[]): string => {
    return JSON.stringify(modules)
}

export const parsseModules = (modulesString: string): CourseModule[] => {
    return JSON.parse(modulesString);
}

export const convertCourseToCourseFormData = (course: Course): CourseFormData => {
    const { title, description, startTime, endTime, category, subcategory, advantages } = course
    return {
        title,
        description,
        startTime,
        endTime,
        category,
        subcategory,
        advantages,
        modules: createCourseModulesFromJson(course.modulesJson)
    }
}

function createCourseModulesFromJson (modulesJson: string): CourseModule[] {
    const modules = JSON.parse(modulesJson) as CourseModule[]
    return modules
}