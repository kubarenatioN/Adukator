import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, filter, map, switchMap, takeUntil, tap, throwError, withLatestFrom } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentCoursesService } from 'src/app/services/student-courses.service';
import { UserService } from 'src/app/services/user.service';
import { User, UserTeacherPermsRequest, UserTrainingProfile } from 'src/app/typings/user.types';
import { BecomeTeacherModalComponent } from './modals/become-teacher-modal/become-teacher-modal.component';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { DataService } from 'src/app/services/data.service';
import { UploadService } from 'src/app/services/upload.service';
import { ConfigService } from 'src/app/services/config.service';
import { RequestCompetenciesModalComponent } from './modals/request-competencies-modal/request-competencies-modal.component';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends CenteredContainerDirective implements OnInit, OnDestroy {
	public user$: Observable<User>;
	public userTrainingProfile$: Observable<UserTrainingProfile>;

	public userTeacherPermsRequest$ = this.userService.teacherPermsRequest$;
	public userCompetenciesRequests$ = this.userService.competenciesRequests$.pipe(
		map(reqs => reqs?.filter(req => req.status === 'pending') ?? [])
	);

	private userAsStudentCourses$ = this.studentCoursesService.courses$;

	public studentPendingCourses$ = this.userAsStudentCourses$;
	public studentApprovedCourses$ = this.userAsStudentCourses$;

	public isUserOwnPage: boolean | null = null
	public disposeLocalFiles$ = new EventEmitter<void>()
	public clearUploadBox$ = new EventEmitter<void>()
	public isLoading = false;

	constructor(
		private dataService: DataService,
		private userService: UserService,
		private router: Router,
		private dialog: MatDialog,
		private studentCoursesService: StudentCoursesService,
		private configService: ConfigService,
		private uploadService: UploadService,
		private activatedRoute: ActivatedRoute,
	) {
		super();
		this.user$ = this.userService.user$.pipe(filter(Boolean));
		this.userTrainingProfile$ = 
		this.configService.competencies$.pipe(
			switchMap(() => this.userService.trainingProfile$)
		)
	}

	ngOnInit(): void {
		this.activatedRoute.paramMap
			.pipe(withLatestFrom(this.userService.user$))
			.subscribe(([params, user]) => {
				const userUrlId = params.get('id')
				this.isUserOwnPage = userUrlId === user?.uuid
			})

		this.getTeacherPermsRequest()
		this.userService.getCompetenciesRequests()
	}

	public override ngOnDestroy(): void {
		this.disposeLocalFiles$.emit()
		super.ngOnDestroy()
	}

	public onRequestTeacherPermission(user: User) {
		this.isLoading = true;
		const dialogRef = this.dialog.open(BecomeTeacherModalComponent, {
			data: { user, dispose: this.disposeLocalFiles$, clear$: this.clearUploadBox$ }
		})
		let formData: any;
		const cancelStream$ = new Subject<void>()
		dialogRef.afterClosed()
		.pipe(
			takeUntil(cancelStream$),
			tap(res => {
				if (!res) {
					this.disposeLocalFiles$.emit()
					cancelStream$.next()
				}
			}),
			tap(data => formData = data),
			withLatestFrom(this.userTeacherPermsRequest$),
			switchMap(([_, request]) => {
				const files = request?.files ?? []
				
				return this.removeFiles(files.map(f => f.public_id))
			}),
			switchMap(() => {
				const folder = this.getTeacherPermsRequestUploadFolder(user)
				return this.uploadService.moveFilesToRemote({
					subject: 'teacher-perms:request-files',
					fromFolder: folder,
				})
			}),
			switchMap(uploadRes => {
				formData.files = uploadRes.result.results.map(f => ({
					secure_url: f.secure_url,
					public_id: f.public_id,
				}))

				return this.dataService.http.post(`${DATA_ENDPOINTS.user}/become-teacher`, {
					request: {
						...formData,
						userId: user._id,
					}
				})
			})
		)
		.subscribe({
			next: res => {
				this.getTeacherPermsRequest()
				this.isLoading = false;
			},
			error: err => {
				this.isLoading = false;
			}
		})
	}

	public cancelTeacherPermsRequest(req: UserTeacherPermsRequest) {
		this.removeFiles(req.files.map(f => f.public_id))
			.subscribe(deleted => {
				this.clearUploadBox$.emit();
				return this.userService.cancelTeacherPermsRequest(req._id)
			})
	}

	public cancelCompsRequest(id: string) {
		console.log(id);
	}

	public requestCompetencies(user: User) {
		this.isLoading = true;
		const dialogRef = this.dialog.open(RequestCompetenciesModalComponent, {
			data: { 
				user,
				competencies: this.configService.competencies,
				dispose: this.disposeLocalFiles$,
			}
		})

		const cancelStream$ = new Subject<void>()
		let formData: any;
		let requestId = '';

		dialogRef.afterClosed()
		.pipe(
			takeUntil(cancelStream$),
			tap(res => {
				if (!res) {
					this.disposeLocalFiles$.emit()
					cancelStream$.next()
				}
			}),
			tap(data => {
				formData = data.form
				requestId = data.requestId
			}),
			switchMap((data) => {
				const { requestId } = data
				const folder = this.getCompetenciesRequestUploadFolder(user, requestId)
				return this.uploadService.moveFilesToRemote({
					subject: 'competencies-request:files',
					fromFolder: folder,
				})
			}),
			switchMap(uploadRes => {
				formData.files = uploadRes.result.results.map(f => ({
					secure_url: f.secure_url,
					public_id: f.public_id,
				}))

				return this.dataService.http.post(`${DATA_ENDPOINTS.user}/competencies`, {
					requestId,
					form: formData,
					userId: user._id,
				})
			}),
		).subscribe({
			next: res => {
				this.userService.getCompetenciesRequests()
			},
			error: err => {
				console.error(err);
			}
		})
	}

	public logOut(): void {
		this.userService.logout();
		this.router.navigate(['/auth']);
	}

	private removeFiles(files: string[]) {
		return this.uploadService.removeRemoteFiles(files)
	}

	private getTeacherPermsRequest() {
		this.userService.getTeacherPermsRequest()
	}

	private getTeacherPermsRequestUploadFolder(user: User) {
		return `teacher-perms-request/${user.uuid}`
	}

	private getCompetenciesRequestUploadFolder(user: User, requestId: string) {
		return `competencies-request/${user.uuid}/${requestId}`
	}
}
