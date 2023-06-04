import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { AdminService } from 'src/app/services/admin.service';
import { ConfigService } from 'src/app/services/config.service';
import { Course, CourseReview } from 'src/app/typings/course.types';
import { UserCompetenciesRequest, UserCompetenciesRequestStatus, UserTeacherPermsRequest } from 'src/app/typings/user.types';
import lgZoom from 'lightgallery/plugins/zoom';
import { LightGalleryAllSettings } from 'lightgallery/lg-settings';

const LightgallerySettings: Partial<LightGalleryAllSettings> = {
	height: '300px',
	width: '600px',
	plugins: [lgZoom]
}

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent
	extends CenteredContainerDirective
	implements OnInit
{
	public lgSettings = LightgallerySettings;
	public reviewCoursesList$!: Observable<CourseReview[]>;
	public userCompetenciesRequests$!: Observable<UserCompetenciesRequest[]>;

	constructor(private adminService: AdminService, private configService: ConfigService) {
		super();
	}

	ngOnInit(): void {
		this.reviewCoursesList$ = this.adminService.reviewCoursesList$;

		this.userCompetenciesRequests$ = this.configService.competencies$.pipe(
			switchMap(() => this.adminService.getUserCompsRequests()),
			map(req => req.sort((a, b) => a.status === 'pending' ? -1 : 1))
		)
	}

	public approveCompReq(reqId: string) {
		this.updateCompetencyRequest('approved', reqId)
	}

	public rejectCompReq(reqId: string) {
		this.updateCompetencyRequest('rejected', reqId)
	}

	private updateCompetencyRequest(status: UserCompetenciesRequestStatus, reqId: string) {
		this.adminService.updateUserCompsRequest(reqId, { status }).subscribe(res => {
			console.log(res);
		})
	}
}
