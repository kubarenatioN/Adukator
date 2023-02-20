import { SelectionChange } from '@angular/cdk/collections';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { breakReferece } from 'src/app/helpers/common.helpers';
import { formatDate } from 'src/app/helpers/date-fns.helper';
import { Course } from 'src/app/typings/course.types';

interface VersionOption { id: number; date: string, checked?: boolean }
type VersionSelect = VersionOption[] 

@Component({
	selector: 'app-course-review-diff',
	templateUrl: './course-review-diff.component.html',
	styleUrls: ['./course-review-diff.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviewDiffComponent implements OnInit {
	private _courseVerions: Course[] = [];
	private _immutableVerionOptions: VersionOption[] = [];

	@Input() public set courseVersions(value: Course[]) {
		this._courseVerions = this.formatVersionsDates(value);
        this.applyDefaultVersions()
        this.prepareVersionOptions(value);
	}

	public versionsPair!: Course[];
	public versionOptions!: VersionSelect[];
    public selectedOptions = Array.from({ length: 2 }) as number[];

    public isLastVersion(course: Course): boolean {
        return this._courseVerions[0].id === course.id
    }

	constructor() {}

	ngOnInit(): void {}

    public onVersionChange(selectIndex: number, versionId: number) {
        this.removeDuplicateVersionsFromSelects()
        this.applyCourseVersion(selectIndex, versionId)
    }

    public onEditModeChange(e: MatCheckboxChange): void {
        console.log(e);
    }

    public applyDefaultVersions() {
        this.versionsPair = this._courseVerions.slice(0, 2);
        this.versionsPair.reverse()
        this.selectedOptions = this.versionsPair.map(version => version.id)
    }

	private prepareVersionOptions(versions: Course[]) {
		const versionsForSelection = versions
			.filter((course) => course.createdAt !== undefined)
			.map((course, i) => {
				return {
					id: course.id,
					date: course.createdAt!,
				};
			});
		this.versionOptions = Array.from({ length: 2 }, () => [...versionsForSelection])

        this._immutableVerionOptions = breakReferece(this.versionOptions[0])

        // Artificially select last and one before last versions
        this.onVersionChange(0, this._immutableVerionOptions[1].id)
        this.onVersionChange(1, this._immutableVerionOptions[0].id)
	}

    private formatVersionsDates(versions: Course[]) {
        return versions.map(version => {
            if (version.createdAt) {
                version.createdAt = formatDate(version.createdAt)
            }
            return version
        })
    }

    private removeDuplicateVersionsFromSelects() {
        const freeItems = this._immutableVerionOptions.filter((option, i) => {
            return !this.selectedOptions.includes(option.id)
        })
        this.versionOptions = this.versionOptions.map((select, i) => {
            return [
                select.find(option => option.id === this.selectedOptions[i])!
            ].concat(freeItems)
        })
    }

    private applyCourseVersion(position: number, versionId: number) {
        const versionIndex = this._courseVerions.findIndex(course => course.id === versionId)
        if (versionIndex !== -1) {
            this.versionsPair[position] = this._courseVerions[versionIndex]
        }
        else {
            this.versionsPair[position] = this._courseVerions[this._courseVerions.length - 1]
        }
    }
}
