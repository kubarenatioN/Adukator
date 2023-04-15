import { Course } from "./course.types";
import { User } from "./user.types";

export type TrainingProfileFull = TrainingProfile<Training, User> 
export type TrainingProfileMeta = TrainingProfile<string, string> 
export type TrainingProfileUser = TrainingProfile<string, User> 
export type TrainingProfileTraining = TrainingProfile<Training, string> 

export interface TrainingProfile<T, U> {
    _id: string;
    uuid: string;
    training: T
    student: U,
    enrollment: TrainingMembershipStatus
}

export type TrainingProfileLookup = TrainingProfileMeta

export interface Training {
    _id: string,
    uuid: string,
    course: Course,
    courseId: string,
    startAt: string,
    status: 'active' | 'archived',
}

export interface TopicDiscussionReply {
    _id: string;
    uuid: string;
    topicId: string;
    profile: string;
	type: 'task' | 'report' | 'check';
    taskId?: string
    message: TrainingReplyMessage
    sender: string;
    date: string;
}

export interface TrainingReply {
    topicId: string;
    profile: string;
	type: 'task' | 'report' | 'check';
    taskId?: string
    message: TrainingReplyMessage
    sender: string;
}

export type TrainingReplyMessage = TrainingTaskAnswer | TrainingReport | TrainingCheck

export interface TrainingTaskAnswer {
	taskId: string;
	files: string[];
	comment?: string;
}

export interface TrainingReport {
	report: string;
}

export interface TrainingCheck {
	comment: string;
    check: {
        [taskId: string]: number
    }
}


export type TrainingMembershipAction = 'enroll' | 'leave' | 'cancel' | 'update'
export enum TrainingMembershipStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface TrainingMembershipSearchParams {
    type: 'list' | 'search',
    trainingId: string,
    enrollment?: TrainingMembershipStatus,
    size?: number,
    page?: number,
    query?: string,
    populate: ('student' | 'training')[]
}

export interface TrainingAccess { 
    hasAccess: boolean, 
    profile?: TrainingProfileLookup 
}
