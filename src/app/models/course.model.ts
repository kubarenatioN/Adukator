import { isActualTopic, isPastTopic } from "../modules/student/helpers/course-training.helper";
import { Course, CourseModule, ModuleTopic } from "../typings/course.types";
import { Training } from "../typings/training.types";

export class StudentTraining {
    private _training: Training
    private _course: Course
    private _topics: ModuleTopic[] = []
    
    public get course() {
        return this._course;
    }
    
    public get id() {
        return this._training.uuid;
    }
    
    public get _id() {
        return this._training._id;
    }

    private set course(value: Course) {
        this._course = value;
    }

    public get modules() {
        return this._course.modules;
    }

    public get topics() {
        return this._topics;
    }
    
    constructor(training: Training) {
        this._training = training;
        this._course = this.patchCourse(training.course);
    }

    private patchCourse(course: Course): Course {
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