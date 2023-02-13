import { HttpHeaders, HttpParams } from "@angular/common/http";
import { DATA_ENDPOINTS } from "../constants/network.constants";
import { DataRequestPayload } from "../services/data.service";

export enum NetworkRequestKey {
    LoginUser = 'LoginUser',
    RegisterUser = 'RegisterUser',
    GetUserByToken = 'GetUserByToken',
    GetAllCourses = 'GetAllCourses',
    GetAllReviewCourses = 'GetAllReviewCourses',
    GetReviewCourseHistory = 'GetReviewCourseHistory',
    GetUserCourses = 'GetUserCourses',
    CreateCourse = 'CreateCourse',
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
    headers?: HttpHeaders
}

interface RequestsMetadataMap {
    [key: string]: RequestCoreMetadata
}

export class NetworkHelper {
    public static authorizationHeader = 'Authorization';
    
    private static requestsMetadataMap: RequestsMetadataMap = {
        [NetworkRequestKey.LoginUser]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.auth.login}`,
        },
        [NetworkRequestKey.RegisterUser]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.auth.login}`,
        },
        [NetworkRequestKey.GetUserByToken]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.auth.user}`,
        },
        [NetworkRequestKey.GetAllCourses]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.course}`,
        },
        [NetworkRequestKey.GetAllReviewCourses]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.course}/review`,
        },
        [NetworkRequestKey.GetReviewCourseHistory]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.course}/review/history`,
        },
        [NetworkRequestKey.GetUserCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.course}/author`,
        },
        [NetworkRequestKey.CreateCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.course}/create`,
        },
        [NetworkRequestKey.PublishCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.course}/publish`,
        },
        [NetworkRequestKey.UpdateCourse]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.course}/update`,
        },
    }

    public static createRequestPayload(key: string, extendedPayload?: RequestMetadata): DataRequestPayload {
        const basePayload = this.requestsMetadataMap[key];
        const { method } = basePayload;
        const headers = extendedPayload?.headers;
        if (method === 'POST') {
            return {
                ...basePayload,
                body: extendedPayload?.body,
                headers,
            }
        }
        else {
            let searchParams = new HttpParams()
            const params = extendedPayload?.params
            if (params) {
                searchParams = new HttpParams({ fromObject: params })
            }
            return {
                ...NetworkHelper.requestsMetadataMap[key],
                params: searchParams,
                headers
            }
        }
    }
}