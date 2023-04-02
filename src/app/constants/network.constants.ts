import { apiUrl } from "./urls";

export const DATA_ENDPOINTS = {
	auth: {
        login: {
            jwt: `${apiUrl}/auth/login/jwt`,
            google: `${apiUrl}/auth/login/google`,
        },
        user: `${apiUrl}/auth/user`,
        register: `${apiUrl}/auth/register`,
    },
    user: `${apiUrl}/user`,
	api: {
        courses: {
            teacher: `${apiUrl}/api/courses/teacher`,
            review: `${apiUrl}/api/courses/review`,
            toString: () => `${apiUrl}/api/courses`
        },
    },
    admin: {
        courses: `${apiUrl}/admin/courses`
    },
};