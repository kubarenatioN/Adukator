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
            membership: `${apiUrl}/api/courses/membership`,
            toString: () => `${apiUrl}/api/courses`
        },
        training: {
            membership: `${apiUrl}/api/training/membership`,
            progress: `${apiUrl}/api/training/progress`,
            toString: () => `${apiUrl}/api/training`
        },
    },
    admin: {
        courses: `${apiUrl}/admin/courses`
    },
};