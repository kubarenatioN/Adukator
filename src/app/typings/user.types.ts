import { Training } from './training.types';

export interface User {
	_id: string;
	uuid: string;
	email: string;
	username: string;
	photo?: string;
	role: 'user' | 'admin';
	permission: 'student' | 'teacher' | 'editor' | 'admin';
	trainingProfile: UserTrainingProfile;
}

export interface UserRegisterData {
	email: string,
	password: string,
	passwordRepeat: string,
}

export interface LoginResponse {
	token: string;
	message: string;
	user: User;
}

export interface UserTrainingProfile {
	_id: string;
	uuid: string;
	competencies: string[];
	trainingHistory: string[] | Training[];
}

export type UserTeacherPermsRequestStatus = 'pending' | 'approved' | 'rejected'
export interface UserTeacherPermsRequest {
	_id: string
	uuid: string
	user: User
	motivation: string
	files: {
		secure_url: string,
		public_id: string,
	}[]
	status: UserTeacherPermsRequestStatus
}