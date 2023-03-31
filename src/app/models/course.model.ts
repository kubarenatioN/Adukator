import { isActualTopic, isPastTopic } from "../modules/student/helpers/course-training.helper";
import { CourseModule, ICourseTraining, ModuleTopic } from "../typings/course.types";

export class CourseTraining {
    private _course: ICourseTraining
    
    public get course() {
        return this._course;
    }

    private set course(value: ICourseTraining) {
        this._course = value;
    }

    public get modules() {
        return this._course.modules;
    }
    
    constructor(course: ICourseTraining) {
        this._course = this.patchCourse(course);
    }

    private patchCourse(course: ICourseTraining): ICourseTraining {
        const topics = this.getTopics(course.modules);
        topics.forEach(topic => {
            topic.isPast = isPastTopic(topic);
        })
        for (let i = topics.length - 1; i >= 0; i--) {
            const topic = topics[i]
            topic.isActual = isActualTopic(topic);
            if (topic.isActual) {
                break;
            }            
        }
        return course;
    }

    public getTopics(modules: CourseModule[]): ModuleTopic[] {
        return modules.reduce((topics, module) => {
            topics.push(...module.topics);
            return topics
        }, new Array<ModuleTopic>())
    }

    public getModule(moduleId: string) {
        return this.course.modules.find(module => module.id === moduleId);
    }

    public getTopicModule(topicId: string) {
        return this.course.modules
            .find(module => 
                module.topics.findIndex(topic => topic.id === topicId) > 0
            );
    }

    public getTopic(topicId: string) {
        const modules = this.modules;
        const topics = this.getTopics(modules);
        return topics.find(topic => topic.id === topicId);
    }
}