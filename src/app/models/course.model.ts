import { isActualTopic, isPastTopic } from "../modules/student/helpers/course-training.helper";
import { CourseModule, CourseTraining, ModuleTopic } from "../typings/course.types";

export class StudentTraining {
    private _course: CourseTraining
    private _topics: ModuleTopic[] = []
    
    public get course() {
        return this._course;
    }
    
    public get id() {
        return this._course.uuid;
    }

    private set course(value: CourseTraining) {
        this._course = value;
    }

    public get modules() {
        return this._course.modules;
    }

    public get topics() {
        return this._topics;
    }
    
    constructor(course: CourseTraining) {
        this._course = this.patchCourse(course);
    }

    private patchCourse(course: CourseTraining): CourseTraining {
        const topics = this.getTopics(course.modules);
        this._topics = topics

        this.topics.forEach(topic => {
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