import { HttpHeaders } from "@angular/common/http";
import { DATA_ENDPOINTS } from "../constants/network.constants";
import { DataRequestPayload } from "../services/data.service";

export enum NetworkRequestKey {
    LoginUser = 'LoginUser',
    RegisterUser = 'RegisterUser',
    GetUserByToken = 'GetUserByToken',
    GetAllCourses = 'GetAllCourses',
    GetUserCourses = 'GetUserCourses',
    CreateCourse = 'CreateCourse',
    PublishCourse = 'PublishCourse',
    UpdateCourse = 'UpdateCourse',
}

interface RequestMetadata {
    method: string,
    url: string,
    body?: object,
    headers?: HttpHeaders
}

interface RequestsMetadataMap {
    [key: string]: RequestMetadata
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
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.course}`,
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

    public static createRequestPayload(key: string, body?: object, headers?: HttpHeaders): DataRequestPayload {
        const configBody = NetworkHelper.requestsMetadataMap[key].body;
        const expandBody = configBody ? {
            ...configBody,
            ...body
        } : body
        return {
            ...NetworkHelper.requestsMetadataMap[key],
            body: expandBody,
            headers
        }
    }
}