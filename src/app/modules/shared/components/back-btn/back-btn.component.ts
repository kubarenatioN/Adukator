import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-back-btn',
	templateUrl: './back-btn.component.html',
	styleUrls: ['./back-btn.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackBtnComponent {
	constructor(private location: Location) {}

	public goBack() {
		this.location.back();
	}
}
