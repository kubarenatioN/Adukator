const apiUrl = 'http://localhost:8080';

export const DATA_ENDPOINTS = {
	auth: {
        login: `${apiUrl}/auth/login/jwt`,
        user: `${apiUrl}/auth/user`,
        register: `${apiUrl}/auth/register`,
    },
	api: {
        course: `${apiUrl}/api/courses`,
    },
    admin: `${apiUrl}/admin`,
};