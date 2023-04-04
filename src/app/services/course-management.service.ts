import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { NetworkHelper, NetworkRequestKey } from '../helpers/network.helper';
import { CourseEnrollAction, CourseMembership, CourseMembershipAction, CourseMembershipSearchParams, CourseMembershipStatus } from '../typings/course.types';
import { CourseEnrollResponseData, CoursesResponse } from '../typings/response.types';
import { User } from '../typings/user.types';
import { DataRequestPayload, DataService } from './data.service';

@Injectable({
	providedIn: 'root',
})
export class CourseManagementService {
    private courseMembershipStore$ = new BehaviorSubject<CourseMembership>({
        pending: [],
        approved: [],
        rejected: [],
    })
    
    public approvedStudents$: Observable<User[]>
    public pendingStudents$: Observable<User[]>
    public rejectedStudents$: Observable<User[]>

	constructor(private dataService: DataService) {
        this.approvedStudents$ = this.courseMembershipStore$.pipe(
            map(store => store.approved),
            shareReplay(1),
        )
        this.pendingStudents$ = this.courseMembershipStore$.pipe(
            map(store => store.pending),
            shareReplay(1),
        )
        this.rejectedStudents$ = this.courseMembershipStore$.pipe(
            map(store => store.rejected),
            shareReplay(1),
        )
    }

    public getCourseMembers(reqParams: CourseMembershipSearchParams): Observable<CourseMembership> {
        const payload = NetworkHelper.createRequestPayload(NetworkRequestKey.CourseMembers, {
            params: {
                ...reqParams
            }
        })
        return this.dataService.send<CoursesResponse<CourseMembership>>(payload).pipe(
            map(res => res.data)
        );
    }

	public setCourseMembershipStatus(
		usersIds: number[],
		courseId: string,
        status: CourseMembershipStatus,
	) {
        const key = NetworkRequestKey.TeacherCourseMembership;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                status,
                usersIds,
                courseId
            },
            params: { action: 'update', reqId: 'SetMembershipStatus' }
        })

        return this.sendMembershipRequest(payload);
    }

	public updateEnrollment(
		usersIds: number[],
		courseId: string,
        action: CourseMembershipAction
	) {
        const key = NetworkRequestKey.CourseMembership;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                usersIds,
                courseId
            },
            params: { action, reqId: 'UpdateEnrollment' }
        })
        
        return this.sendMembershipRequest(payload);
	}

    public lookupEnrollment(usersIds: number[], courseId: string) {
        const key = NetworkRequestKey.CourseMembership;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: {
                usersIds,
                courseId
            },
            params: { action: 'lookup', reqId: 'LookupCourseMembership' }
        })

        return this.sendMembershipRequest<{ data: CourseEnrollResponseData[], action: string }>(payload);
    }

    public queryEnrollments(query: CourseMembershipSearchParams) {
        const key = NetworkRequestKey.CourseMembership;
        const payload = NetworkHelper.createRequestPayload(key, {
            body: { ...query },
            params: { action: 'members', reqId: 'LookupCourseMembership' }
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
