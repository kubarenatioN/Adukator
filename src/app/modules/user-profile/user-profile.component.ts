import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, filter, switchMap, takeUntil, tap, throwError, withLatestFrom } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { StudentCoursesService } from 'src/app/services/student-courses.service';
import { UserService } from 'src/app/services/user.service';
import { User, UserTeacherPermsRequest, UserTrainingProfile } from 'src/app/typings/user.types';
import { BecomeTeacherModalComponent } from './modals/become-teacher-modal/become-teacher-modal.component';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { DataService } from 'src/app/services/data.service';
import { UploadService } from 'src/app/services/upload.service';

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
		private uploadService: UploadService,
		private activatedRoute: ActivatedRoute,
	) {
		super();
		this.user$ = this.userService.user$.pipe(filter(Boolean));
		this.userTrainingProfile$ = this.userService.trainingProfile$;
	}

	ngOnInit(): void {
		this.activatedRoute.paramMap
			.pipe(withLatestFrom(this.userService.user$))
			.subscribe(([params, user]) => {
				const userUrlId = params.get('id')
				this.isUserOwnPage = userUrlId === user?.uuid
			})

		this.getTeacherPermsRequest()
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
				
				return this.removeTeacherFiles(files.map(f => f.public_id))
			}),
			switchMap(() => {
				const folder = this.getUserRequestFilesUploadFolder(user)
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
		this.removeTeacherFiles(req.files.map(f => f.public_id))
			.subscribe(deleted => {
				this.clearUploadBox$.emit();
				return this.userService.cancelTeacherPermsRequest(req._id)
			})
	}

	private removeTeacherFiles(files: string[]) {
		return this.uploadService.removeRemoteFiles(files)
	}

	public logOut(): void {
		this.userService.logout();
		this.router.navigate(['/auth']);
	}

	private getTeacherPermsRequest() {
		this.userService.getTeacherPermsRequest()
	}

	private getUserRequestFilesUploadFolder(user: User) {
		return `teacher-perms-request/${user.uuid}`
	}
}
