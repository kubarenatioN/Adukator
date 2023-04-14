import { Course } from "./course.types";
import { User } from "./user.types";

export interface TrainingProfile {
    _id: string;
    uuid: string;
    training: Training
    student: User,
    enrollment: TrainingMembershipStatus
}

export interface TrainingProfileLookup {
    _id: string;
    uuid: string;
    training: string
    student: string,
    enrollment: TrainingMembershipStatus
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


export type TrainingMembershipAction = 'enroll' | 'leave' | 'cancel' | 'update'
export enum TrainingMembershipStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface TrainingMembershipMap {
    pending: TrainingProfile[];
    approved: TrainingProfile[];
    rejected: TrainingProfile[];
}

export interface TrainingMembershipSearchParams {
    type: 'list' | 'search',
    trainingId: string,
    status?: TrainingMembershipStatus,
    size?: number,
    page?: number,
    query?: string,
    populate: ('student' | 'training')[]
}

export interface TrainingAccess { 
    hasAccess: boolean, 
    profile?: TrainingProfileLookup 
}