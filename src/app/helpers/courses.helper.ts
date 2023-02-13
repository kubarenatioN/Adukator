import { CourseModule } from "../typings/course.types";

export const stringifyModules = (modules: CourseModule[]): string => {
    return JSON.stringify(modules)
}

export const parsseModules = (modulesString: string): CourseModule[] => {
    return JSON.parse(modulesString);
}