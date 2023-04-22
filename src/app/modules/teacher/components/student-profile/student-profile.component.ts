import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-student-profile',
	templateUrl: './student-profile.component.html',
	styleUrls: ['./student-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {
	constructor(private activatedRoute: ActivatedRoute) {

    }

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			const profileId = params['profileId'];
            
        });
	}
}
