import { HttpContext, HttpContextToken, HttpHeaders, HttpParams } from "@angular/common/http";
import { DATA_ENDPOINTS } from "../constants/network.constants";
import { DataRequestPayload } from "../services/data.service";

export enum NetworkRequestKey {
    LoginUser = 'LoginUser',
    RegisterUser = 'RegisterUser',
    GetUserByToken = 'GetUserByToken',
    GetUserById = 'GetUserById',
    
    GetAllCourses = 'GetAllCourses',
    GetCourseById = 'GetCourseById',
    GetStudentCourses = 'GetStudentCourses',
    GetReviewCourseHistory = 'GetReviewCourseHistory',
    CreateCourseVersion = 'CreateCourseVersion',
    EnrollCourse = 'EnrollCourse',
    GetCourseMembers = 'GetCourseMembers',

    GetAllAdminReviewCourses = 'GetAllAdminReviewCourses',
    GetAdminReviewCourseById = 'GetAdminReviewCourseById',
    UpdateCourseReview = 'UpdateCourseReview',
    PublishCourse = 'PublishCourse',

    GetTeacherCourses = 'GetTeacherCourses',
    
    UpdateCourse = 'UpdateCourse',
}

export const REQUEST_TYPE = new HttpContextToken<string>(() => '');

interface RequestCoreMetadata {
    method: string,
    url: string,
}

interface RequestMetadata {
    body?: Record<string, string | number | object | boolean | undefined>;
    params?: Record<string, string | string[] | number | number[]>
    urlId?: string | number;
    headers?: HttpHeaders
}

interface RequestsMetadataMap {
    [key: string]: RequestCoreMetadata
}

export class NetworkHelper {
    public static authorizationHeader = 'Authorization';
    
    private static requestsMetadataMap: RequestsMetadataMap = {
        /* ADMIN RELATED */
        [NetworkRequestKey.GetAdminReviewCourseById]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.admin.courses}/review`,
        },
        [NetworkRequestKey.GetAllAdminReviewCourses]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.admin.courses}/review`,
        },
        [NetworkRequestKey.UpdateCourseReview]: {
            method: 'PUT',
            url: `${DATA_ENDPOINTS.admin.courses}/review/update`,
        },
        [NetworkRequestKey.PublishCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.admin.courses}/publish`,
        },

        /* AUTH RELATED */
        [NetworkRequestKey.LoginUser]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.auth.login.jwt}`,
        },
        [NetworkRequestKey.RegisterUser]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.auth.register}`,
        },
        [NetworkRequestKey.GetUserByToken]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.auth.user}`,
        },
        [NetworkRequestKey.GetUserById]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.user}`,
        },

        /* COMMON */
        [NetworkRequestKey.GetAllCourses]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}`,
        },
        [NetworkRequestKey.GetCourseById]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}`,
        },
        [NetworkRequestKey.GetStudentCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/student`,
        },
        [NetworkRequestKey.EnrollCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/enroll`,
        },

        /* TEACHER RELATED */
        [NetworkRequestKey.UpdateCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/update`,
        },
        [NetworkRequestKey.GetTeacherCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/teacher`,
        },
        [NetworkRequestKey.CreateCourseVersion]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.coursesReview}/create`,
        },
        [NetworkRequestKey.GetReviewCourseHistory]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}/review/history`,
        },
        [NetworkRequestKey.GetCourseMembers]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}/members`,
        },
    }

    public static createRequestPayload(key: string, extendedPayload?: RequestMetadata): DataRequestPayload {
        const basePayload = this.requestsMetadataMap[key];
        const { method } = basePayload;
        const headers = extendedPayload?.headers;
        const context = new HttpContext().set(REQUEST_TYPE, key);

        const request: DataRequestPayload = {
            ...basePayload,
            headers,
            context,
        }
        if (method === 'POST' || method === 'PUT') {
            request.body = extendedPayload?.body;
        }
        else if (method === 'GET') {
            let searchParams = new HttpParams()
            let { url } = basePayload
            const { params, urlId } = extendedPayload ?? {}
            if (params) {
                searchParams = new HttpParams({ fromObject: params })
            }
            if (urlId) {
                url = `${url}/${String(urlId)}`
            }
            request.params = searchParams;
            request.url = url
        }
        else {
            throw new Error('Unknown request method.')
        }

        return request;
    }
}