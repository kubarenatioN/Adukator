import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { map, Observable } from 'rxjs';
import { breakObjectReference } from 'src/app/helpers/common.helpers';
import { formatDate } from 'src/app/helpers/date-fns.helper';
import { UserService } from 'src/app/services/user.service';
import {
	CourseFormData,
	CourseReview,
	CourseReviewStatus,
	CourseReviewStatusMap,
} from 'src/app/typings/course.types';

interface VersionOption {
	id: string;
	date: string;
	checked?: boolean;
}
type VersionSelect = VersionOption[];

@Component({
	selector: 'app-course-review-diff',
	templateUrl: './course-review-diff.component.html',
	styleUrls: ['./course-review-diff.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewDiffComponent implements OnInit {
	private _hasMoreThanOneVersion: boolean = false;
	private _courseVerions: any[] = [];
	private _immutableVerionOptions: VersionOption[] = [];

	@Input() public set courseVersions(value: CourseReview[]) {
		this._hasMoreThanOneVersion = value.length > 1;
		if (!this.hasMoreThanOneVersion) {
			value.push({ isDummy: true } as unknown as CourseReview);
		}
		this._courseVerions = this.formatVersions(value);
		this.applyDefaultVersions();
		this.prepareVersionOptions(value);
	}

	public versionsPair: CourseFormData[] = [];
	public versionOptions: VersionSelect[] = [];
	public selectedOptions = Array.from({ length: 2 }) as string[];

	public courseReviewStatuses = CourseReviewStatus;
	public statusesMap = CourseReviewStatusMap;

	public get hasMoreThanOneVersion(): boolean {
		return this._hasMoreThanOneVersion;
	}

	constructor(private userService: UserService) {}

	ngOnInit(): void {}

	public onVersionChange(selectIndex: number, versionId: string) {
		this.removeDuplicateVersionsFromSelects();
		this.applyCourseVersion(selectIndex, versionId);
	}

	public onEditModeChange(e: MatCheckboxChange): void {
		console.log(e);
	}

	public applyDefaultVersions() {
		this.versionsPair = this._courseVerions.slice(0, 2);
		this.versionsPair.reverse();
		this.selectedOptions = this.versionsPair.map(
			(version) => version.metadata.uuid
		);
	}

	private prepareVersionOptions(versions: CourseReview[]) {
		console.log(versions);
		const versionsForSelection = versions
			.filter(
				(course) =>
					course.createdAt !== undefined || (course as any).isDummy
			)
			.map((course, i) => {
				return {
					id: course.uuid,
					date: course.createdAt!,
				};
			});
		this.versionOptions = Array.from({ length: 2 }, () => [
			...versionsForSelection,
		]);

		// get second item with index 1, because the first one (index = 0) can be dummy
		this._immutableVerionOptions = breakObjectReference(
			this.versionOptions[1]
		);

		// Artificially select last and one before last versions
		this.onVersionChange(0, this._immutableVerionOptions[1].id);
		this.onVersionChange(1, this._immutableVerionOptions[0].id);
	}

	public canShowCourseVersionActionButton(
		status: CourseReviewStatus,
		course: CourseFormData
	): Observable<boolean> {
		return this.userService.user$.pipe(
			map((user) => {
				const isVisibleForTeacher =
					user?.role === 'teacher' &&
					status === CourseReviewStatus.ReadyForUpdate;
				const isVisibleForEditor =
					user?.role === 'admin' &&
					status === CourseReviewStatus.ReadyForReview;

				const isLastVersion = this.isLastVersion(course);

				return (
					isLastVersion && (isVisibleForTeacher || isVisibleForEditor)
				);
			})
		);
	}

	private isLastVersion(course: CourseFormData): boolean {
		return this._courseVerions[0].metadata.uuid === course.metadata.uuid;
	}

	private formatVersions(versions: CourseReview[]) {
		return versions.map((version) => {
			const formData = (version as any).isDummy
				? ({
						metadata: {},
						overallInfo: {},
				  } as unknown as CourseFormData)
				: {
						overallInfo: {
							title: version.title,
						},
						metadata: {
							uuid: version.uuid,
							status: version.status,
						},
						createdAt: version.createdAt,
				  };
			if (version.createdAt) {
				formData.createdAt = formatDate(version.createdAt);
			}
			return formData;
		});
	}

	private removeDuplicateVersionsFromSelects() {
		const freeItems = this._immutableVerionOptions.filter((option, i) => {
			return !this.selectedOptions.includes(option.id);
		});
		this.versionOptions = this.versionOptions.map((select, i) => {
			return [
				select.find((option) => option.id === this.selectedOptions[i])!,
			].concat(freeItems);
		});
	}

	private applyCourseVersion(position: number, versionId: string) {
		const versionIndex = this._courseVerions.findIndex(
			(course) => course.metadata.uuid === versionId
		);
		if (versionIndex !== -1) {
			this.versionsPair[position] = this._courseVerions[versionIndex];
		} else {
			this.versionsPair[position] =
				this._courseVerions[this._courseVerions.length - 1];
		}
	}
}
