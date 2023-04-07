import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { CourseMembershipSearchParams, CourseMembershipStatus, CourseMembershipAction, CourseMembershipMap } from '../typings/course.types';
import { CourseEnrollResponseData, CoursesResponse } from '../typings/response.types';
import { User } from '../typings/user.types';
import { DataRequestPayload, DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class CourseManagementService {
	constructor(private dataService: DataService) {
        
    }

    public getCourseMembers(reqParams: CourseMembershipSearchParams) {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.CourseMembers, {
            body: {
                ...reqParams
            },
            params: {
                reqId: 'CourseMembers'
            }
        })
        
        return this.dataService.send<{ data: { user: User }[] }>(payload).pipe(
            map(res => res.data.map(item => item.user))
        );
    }

	public setCourseMembershipStatus(
		usersIds: number[],
		courseId: string,
        status: CourseMembershipStatus,
	) {
        const key = NetworkRequestKey.UpdateMembership;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                status,
                usersIds,
                courseId
            },
            params: { reqId: 'UpdateMembership' }
        })

        return this.sendMembershipRequest(payload);
    }

	public updateEnrollment(
		usersIds: number[],
		courseId: string,
        action: CourseMembershipAction
	) {
        const key = NetworkRequestKey.CourseEnroll;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                usersIds,
                courseId
            },
            params: { action, reqId: 'CourseEnroll' }
        })
        
        return this.sendMembershipRequest(payload);
	}

    public lookupEnrollment(usersIds: number[], courseId: string) {
        const key = NetworkRequestKey.CourseMembershipLookup;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                usersIds,
                courseId
            },
            params: { reqId: 'CourseMembershipLookup' }
        })

        return this.sendMembershipRequest<{ data: CourseEnrollResponseData[], action: string }>(payload);
    }

    private sendMembershipRequest<T>(payload: DataRequestPayload) {
        return this.dataService.send<T>(payload).pipe(
            catchError(error => {
                console.error('Enroll status error', error);
                return throwError(() => new Error(error.message));
            })
        )
    }
}
