import { HttpHeaders, HttpParams } from "@angular/common/http";
import { DATA_ENDPOINTS } from "../constants/network.constants";
import { DataRequestPayload } from "../services/data.service";

export enum NetworkRequestKey {
    LoginUser = 'LoginUser',
    RegisterUser = 'RegisterUser',
    GetUserByToken = 'GetUserByToken',
    
    GetAllCourses = 'GetAllCourses',
    GetCoursesByUser = 'GetCoursesByUser',
    GetReviewCourseHistory = 'GetReviewCourseHistory',
    CreateCourse = 'CreateCourse',

    GetAllAdminReviewCourses = 'GetAllAdminReviewCourses',
    GetAdminReviewCourseById = 'GetAdminReviewCourseById',
    UpdateCourseReview = 'UpdateCourseReview',
    
    PublishCourse = 'PublishCourse',
    UpdateCourse = 'UpdateCourse',
}

interface RequestCoreMetadata {
    method: string,
    url: string,
}

interface RequestMetadata {
    body?: Record<string, string | number | object | undefined>;
    params?: Record<string, string | number>
    urlId?: string | number;
    headers?: HttpHeaders
}

interface RequestsMetadataMap {
    [key: string]: RequestCoreMetadata
}

export class NetworkHelper {
    public static authorizationHeader = 'Authorization';
    
    private static requestsMetadataMap: RequestsMetadataMap = {
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
        [NetworkRequestKey.GetAllCourses]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}`,
        },
        [NetworkRequestKey.GetReviewCourseHistory]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}/review/history`,
        },
        [NetworkRequestKey.GetCoursesByUser]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/author`,
        },
        [NetworkRequestKey.CreateCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/create`,
        },
        [NetworkRequestKey.PublishCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/publish`,
        },
        [NetworkRequestKey.UpdateCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/update`,
        },
    }

    public static createRequestPayload(key: string, extendedPayload?: RequestMetadata): DataRequestPayload {
        const basePayload = this.requestsMetadataMap[key];
        const { method } = basePayload;
        const headers = extendedPayload?.headers;
        if (method === 'POST' || method === 'PUT') {
            return {
                ...basePayload,
                body: extendedPayload?.body,
                headers,
            }
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
            return {
                ...basePayload,
                url,
                params: searchParams,
                headers
            }
        }
        else {
            throw new Error('Unknown request method.')
        }
    }
}