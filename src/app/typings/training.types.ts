import { Course } from "./course.types";

export interface TrainingProfile {
    _id: string;
    uuid: string;
    training: Training
    student: string
}

export interface Training {
    _id: string,
    uuid: string,
    course: Course,
    courseId: string,
    startAt: string,
    status: 'active' | 'archived',
}

export interface TrainingReply {
    topicId: string;
    profile: string;
    message: TrainingReplyMessage
    sender: string;
    date?: string;
}

export interface TrainingReplyMessage {
	type: 'task' | 'report' | 'check';
	data: TrainingTaskAnswer | unknown;
	taskId?: string;
}

export interface TrainingTaskAnswer {
	id: string;
	files: string[];
	comment?: string;
}