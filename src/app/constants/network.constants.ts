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
        courses: `${apiUrl}/api/courses`,
        coursesReview: `${apiUrl}/api/courses/review`,
    },
    admin: {
        courses: `${apiUrl}/admin/courses`
    },
};