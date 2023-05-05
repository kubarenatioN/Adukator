import { isActualTopic, isPastTopic } from "../modules/student/helpers/course-training.helper";
import { Course, CourseModule, ModuleTopic } from "../typings/course.types";
import { Training } from "../typings/training.types";

export class StudentTraining {
    private _training: Training
    private _course: {
        course: Course,
        contentTree: {
            moduleId: string,
            module: CourseModule,
            topics: ModuleTopic[]
        }[]
    }
    private _topics: ModuleTopic[] = []

    public get contentTree() {
        return this._course.contentTree
    }
    
    public get course() {
        return this._course.course;
    }

    public get training() {
        return this._training
    }
    
    public get id() {
        return this._training.uuid;
    }
    
    public get _id() {
        return this._training._id;
    }

    public get modules() {
        return this.course.modules;
    }

    public get topics() {
        return this._topics;
    }
    
    constructor(training: Training) {
        this._training = training;
        this._course = this.prepareCourse(training.course)
    }

    private prepareCourse(course: Course) {
        this._topics = course.topics.slice();

        const contentTree = course.modules.map(module => {
            return {
                moduleId: module.id,
                module,
                topics: this._topics.filter(topic => topic.moduleId === module.id)
            }
        })

        this.topics.forEach(topic => {
            topic.isPast = isPastTopic(topic);
        })
        for (let i = this.topics.length - 1; i >= 0; i--) {
            const topic = this.topics[i]
            topic.isActual = isActualTopic(topic);
            if (topic.isActual) {
                break;
            }            
        }

        return {
            course,
            contentTree,
        } 
    }

    public getModule(moduleId: string) {
        return this.course.modules.find(module => module.id === moduleId);
    }

    public getTopicModule(topic: ModuleTopic | undefined) {
        if (!topic) {
            return;
        }
        const moduleId = topic.moduleId
        return this.course.modules.find(module => module.id === moduleId)
    }

    public getTopic(topicId: string) {
        return this.topics.find(topic => topic.id === topicId);
    }
}