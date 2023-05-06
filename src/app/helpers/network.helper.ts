import { HttpContext, HttpContextToken, HttpHeaders, HttpParams } from "@angular/common/http";
import { DATA_ENDPOINTS } from "../constants/network.constants";
import { DataRequestPayload } from "../services/data.service";

export enum NetworkRequestKey {
    LoginUser = 'LoginUser',
    RegisterUser = 'RegisterUser',
    GetUserByToken = 'GetUserByToken',
    GetUserById = 'GetUserById',
    
    // GENERAL
    SelectCourses = 'SelectCourses',
    ListCourses = 'ListCourses',
    // bundle
    CreateCoursesBundle = 'CreateCoursesBundle',
    GetCoursesBundles = 'GetCoursesBundles',
    
    // TRAINING
    SelectTrainings = 'SelectTrainings',
    TrainingList = 'TrainingList',
    TrainingProfile = 'TrainingProfile',
    StudentProfiles = 'StudentProfiles',
    // TrainingStudents = 'TrainingStudents',
    TrainingProfiles = 'TrainingProfiles',
    CreateTrainingEnroll = 'CreateTrainingEnroll',
    UpdateTrainingEnroll = 'UpdateTrainingEnroll',
    DeleteTrainingEnroll = 'DeleteTrainingEnroll',
    TrainingMembers = 'TrainingMembers',
    TrainingMembershipLookup = 'TrainingMembershipLookup',
    
    TrainingReply = 'TrainingReply',
    TrainingTopicDiscussion = 'TrainingTopicDiscussion',
    TrainingProfileProgress = 'TrainingProfileProgress',
    UpdateTrainingProfileProgress = 'UpdateTrainingProfileProgress',
    TrainingStart = 'TrainingStart',
    TrainingComplete = 'TrainingComplete',

    // Personalization
    CreateTask = 'CreateTask',
    GetPersonalTasks = 'GetPersonalTasks',
    PersonalizationAssignment = 'PersonalizationAssignment',
    Personalization = 'Personalization',

    // REVIEW
    GetReviewCourseHistory = 'GetReviewCourseHistory',
    GetCourseReviewHistory = 'GetCourseReviewHistory',
    CreateCourseVersion = 'CreateCourseVersion',
    GetAdminReviewCourses = 'GetAdminReviewCourses',
    
    UpdateCourseReview = 'UpdateCourseReview',
    PublishCourse = 'PublishCourse',

    // TEACHER
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
        [NetworkRequestKey.SelectCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/select`,
        },
        [NetworkRequestKey.ListCourses]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/list`,
        },
        [NetworkRequestKey.CreateCoursesBundle]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.courses}/bundle`,
        },
        [NetworkRequestKey.GetCoursesBundles]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.courses}/bundle`,
        },

        /* TRAINING */
        [NetworkRequestKey.SelectTrainings]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/select`,
        },
        [NetworkRequestKey.TrainingList]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/list`,
        },
        // [NetworkRequestKey.TrainingAccess]: {
        //     method: 'POST',
        //     url: `${DATA_ENDPOINTS.api.training}/access`,
        // },

        [NetworkRequestKey.CreateTrainingEnroll]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training.membership}/enroll`,
        },
        [NetworkRequestKey.UpdateTrainingEnroll]: {
            method: 'PATCH',
            url: `${DATA_ENDPOINTS.api.training.membership}/enroll`,
        },
        [NetworkRequestKey.DeleteTrainingEnroll]: {
            method: 'DELETE',
            url: `${DATA_ENDPOINTS.api.training.membership}/enroll`,
        },
        [NetworkRequestKey.TrainingMembers]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training.membership}/members`,
        },
        [NetworkRequestKey.TrainingMembershipLookup]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training.membership}/lookup`,
        },
        [NetworkRequestKey.TrainingStart]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/start`,
        },
        [NetworkRequestKey.TrainingComplete]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/complete`,
        },

        [NetworkRequestKey.TrainingProfile]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/profile`
        },
        [NetworkRequestKey.TrainingProfiles]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/profiles`
        },
        [NetworkRequestKey.StudentProfiles]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/student`
        },
        [NetworkRequestKey.TrainingReply]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/reply`
        },
        [NetworkRequestKey.TrainingTopicDiscussion]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training}/discussion`
        },
        [NetworkRequestKey.TrainingProfileProgress]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.training.progress}`
        },
        [NetworkRequestKey.UpdateTrainingProfileProgress]: {
            method: 'PATCH',
            url: `${DATA_ENDPOINTS.api.training.progress}/add`
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

        [NetworkRequestKey.CreateTask]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.personalization.teacher.task}`,
        },
        [NetworkRequestKey.GetPersonalTasks]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.personalization.teacher.task}`,
        },
        [NetworkRequestKey.PersonalizationAssignment]: {
            method: 'POST',
            url: `${DATA_ENDPOINTS.api.personalization}/assign`,
        },
        [NetworkRequestKey.Personalization]: {
            method: 'GET',
            url: `${DATA_ENDPOINTS.api.personalization}`,
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
        request.body = extendedPayload?.body;
        
        const { params } = extendedPayload ?? {}
        const searchParams = new HttpParams({ fromObject: params })
        request.params = searchParams;

        let { url } = basePayload
        const { urlId } = extendedPayload ?? {}
        
        if (urlId) {
            url = `${url}/${String(urlId)}`
        }
        request.url = url

        return request;
    }
}