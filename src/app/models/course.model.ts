import { addDays } from 'date-fns/esm';
import { formatTopicsDeadlines } from '../modules/student/helpers/course-training.helper';
import { Course, CourseModule, ModuleTopic } from '../typings/course.types';
import { Personalization, Training } from '../typings/training.types';

export class StudentTraining {
	private _training: Training;
	private _course: {
		course: Course;
		contentTree: {
			moduleId: string;
			module: CourseModule;
			topics: ModuleTopic[];
		}[];
	};
	private _topics: ModuleTopic[] = [];

	public get contentTree() {
		return this._course.contentTree;
	}

	public get course() {
		return this._course.course;
	}

	public get training() {
		return this._training;
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

	public get status() {
		return this._training.status;
	}

	constructor(
		training: Training,
		options?: { personalization?: Personalization[] }
	) {
		this._training = training;
		this._course = this.prepareCourse(training.course);
		if (options?.personalization) {
			this.applyPersonalization(options.personalization);
		}
	}

	private prepareCourse(course: Course) {
		this._topics = course.topics.slice();
		this._topics = formatTopicsDeadlines(this.topics, this.training);

		const contentTree = course.modules.map((module) => {
			return {
				moduleId: module.id,
				module,
				topics: this._topics.filter(
					(topic) => topic.moduleId === module.id
				),
			};
		});

		return {
			course,
			contentTree,
		};
	}

	private applyPersonalization(personalization: Personalization[]) {
		const openings = personalization.filter(
			(pers) => pers.type === 'opening'
		);
		this._topics = this._topics.map((topic) => {
			const tasks = topic.practice?.tasks;
			tasks?.forEach((task, i, arr) => {
				if (
					openings.findIndex(
						(opening) => opening.opening === task.id
					) > -1
				) {
					arr[i].isOpened = true;
				}
			});

			return {
				...topic,
				tasks,
			};
		});
	}

	public getModule(moduleId: string) {
		return this.course.modules.find((module) => module.id === moduleId);
	}

	public getTopicModule(topic: ModuleTopic | undefined) {
		if (!topic) {
			return;
		}
		const moduleId = topic.moduleId;
		return this.course.modules.find((module) => module.id === moduleId);
	}

	public getTopic(topicId: string) {
		return this.topics.find((topic) => topic.id === topicId);
	}
}
