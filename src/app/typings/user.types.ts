export interface User {
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
