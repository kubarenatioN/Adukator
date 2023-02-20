// const apiUrl = 'http://localhost:8080';
const apiUrl = 'https://expensive-pink-goshawk.cyclic.app';

export const DATA_ENDPOINTS = {
	auth: {
        login: {
            jwt: `${apiUrl}/auth/login/jwt`,
            google: `${apiUrl}/auth/login/google`,
        },
        user: `${apiUrl}/auth/user`,
        register: `${apiUrl}/auth/register`,
    },
	api: {
        course: `${apiUrl}/api/courses`,
    },
    admin: `${apiUrl}/admin`,
};