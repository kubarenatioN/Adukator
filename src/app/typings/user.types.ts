import { Training } from "./training.types";

export interface User {
	_id: string;
	uuid: string;
	email: string;
	username: string;
	photo?: string;
	role?: 'teacher' | 'student' | 'admin'
}

export interface LoginResponse {
	token: string;
	message: string;
	user: User;
}

export interface UserTrainingProfile {
	_id: string
	uuid: string
	competencies: string[]
	finishedTrainings: Training[]
}