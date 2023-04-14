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

export interface TopicDiscussionReply {
    _id: string
    uuid: string
    topicId: string
    profile: string
    message: DiscussionReplyMessage,
    sender: string
    date: string
}

export interface DiscussionReplyMessage {
    type: 'task' | 'check' | 'report'
    taskId?: string
    data: DiscussionMessageData
}

export interface DiscussionMessageData {
    id?: string,
    files?: string[]
    comment?: string

}
