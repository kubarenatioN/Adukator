export interface User {
	id: string;
	email: string;
	username: string;
}

export interface LoginResponse {
	token: string;
	message: string;
	user: User;
}
