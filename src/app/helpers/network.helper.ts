import { HttpContext, HttpContextToken, HttpHeaders, HttpParams } from "@angular/common/http";
import { DATA_ENDPOINTS } from "../constants/network.constants";
import { DataRequestPayload } from "../services/data.service";

export enum NetworkRequestKey {
    LoginUser = 'LoginUser',
    RegisterUser = 'RegisterUser',
    GetUserByToken = 'GetUserByToken',
    GetUserById = 'GetUserById',
    
    // GENERAL
    GetCourses = 'GetCourses',
    ListCourses = 'ListCourses',
    StudentCourses = 'StudentCourses',
    TrainingAvailable = 'TrainingAvailable',
    
    CourseMembership = 'CourseMembership',
    CourseEnroll = 'CourseEnroll',
    CourseMembershipLookup = 'CourseMembershipLookup',

    // REVIEW
    GetReviewCourseHistory = 'GetReviewCourseHistory',
    GetCourseReviewHistory = 'GetCourseReviewHistory',
    CreateCourseVersion = 'CreateCourseVersion',
    GetAdminReviewCourses = 'GetAdminReviewCourses',
    
    UpdateCourseReview = 'UpdateCourseReview',
    PublishCourse = 'PublishCourse',

    // TEACHER
    UpdateMembership = 'UpdateMembership',
    CourseMembers = 'CourseMembers',
    GetReviewCourses = 'GetReviewCourses',
    TeacherCourses = 'TeacherCourses',
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
        [NetworkRequestKey.GetAdminReviewCourses]: {
            method: 'POST',
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
        
        // Main Courses
        [NetworkRequestKey.GetCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/select`,
        },
        [NetworkRequestKey.ListCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/list`,
        },
        [NetworkRequestKey.StudentCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/student`,
        },

        
        [NetworkRequestKey.CourseMembers]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.membership}/members`,
        },
        [NetworkRequestKey.CourseMembershipLookup]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.membership}/lookup`,
        },
        [NetworkRequestKey.CourseEnroll]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.membership}/enroll`,
        },

        /* TRAINING */
        [NetworkRequestKey.TrainingAvailable]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/available`,
        },

        /* REVIEW */
        [NetworkRequestKey.GetReviewCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.review}/select`,
        },
        [NetworkRequestKey.GetCourseReviewHistory]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.review}/history`,
        },

        /* TEACHER RELATED */
        [NetworkRequestKey.TeacherCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.teacher}`,
        },
        [NetworkRequestKey.CreateCourseVersion]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.review}/create`,
        },
        [NetworkRequestKey.UpdateMembership]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses.teacher}/membership/update`,
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

        const { params } = extendedPayload ?? {}
        const searchParams = new HttpParams({ fromObject: params })
        request.params = searchParams;

        if (method === 'POST' || method === 'PUT') {
            request.body = extendedPayload?.body;
        }
        else if (method === 'GET') {
            let { url } = basePayload
            const { urlId } = extendedPayload ?? {}
            
            if (urlId) {
                url = `${url}/${String(urlId)}`
            }
            request.url = url
        }
        else {
            throw new Error('Unknown request method.')
        }

        return request;
    }
}