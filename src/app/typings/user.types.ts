export interface User {
	id: string;
	email: string;
	username: string;
    role: 'teacher' | 'student' | 'admin'
}

export interface LoginResponse {
	token: string;
	message: string;
	user: User;
}
