import { ChangeDetectionStrategy, Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, switchMap, takeUntil, tap, throwError, withLatestFrom } from 'rxjs';
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
export class UserProfileComponent extends CenteredContainerDirective implements OnInit {
	public user$: Observable<User | null>;
	public userTrainingProfile$: Observable<UserTrainingProfile>;

	public userTeacherPermsRequest$ = this.userService.teacherPermsRequest$;

	private userAsStudentCourses$ = this.studentCoursesService.courses$;

	public studentPendingCourses$ = this.userAsStudentCourses$;
	public studentApprovedCourses$ = this.userAsStudentCourses$;

	public isUserOwnPage: boolean | null = null
	public disposeLocalFiles$ = new EventEmitter<void>()

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
		this.user$ = this.userService.user$;
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

	public onRequestTeacherPermission(user: User) {
		const dialogRef = this.dialog.open(BecomeTeacherModalComponent, {
			data: { user, dispose: this.disposeLocalFiles$ }
		})
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
			switchMap(data => {
				return this.dataService.http.post(`${DATA_ENDPOINTS.user}/become-teacher`, {
					request: {
						...data,
						userId: user._id,
					}
				})
			}),
			withLatestFrom(this.user$),
			switchMap(([_, user]) => {
				if (!user) {
					return throwError(() => new Error('No user'))
				}
				const folder = this.getUserRequestFilesUploadFolder(user)
				return this.uploadService.moveFilesToRemote({
					subject: 'teacher-perms:request-files',
					fromFolder: folder,
				})
			})
		)
		.subscribe(res => {
			this.getTeacherPermsRequest()
		})
	}

	public cancelTeacherPermsRequest() {
		this.userService.cancelTeacherPermsRequest()
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
