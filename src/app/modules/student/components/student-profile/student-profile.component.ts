import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { TrainingProfileTraining } from 'src/app/typings/training.types';
import { StudentProfileService } from '../../services/student-profile.service';
import { StudentTrainingService } from '../../services/student-training.service';

enum ViewMode {
	SingleProfile = 'SingleProfile',
	ProfilesList = 'ProfilesList',
}

type ViewData = {
    mode: ViewMode,
    profile?: TrainingProfileTraining | null
    hasAccess?: boolean
}

@Component({
	selector: 'app-student-profile',
	templateUrl: './student-profile.component.html',
	styleUrls: ['./student-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {
	private viewDataStore$ = new ReplaySubject<ViewData>();

    public viewData$: Observable<ViewData> = this.viewDataStore$.asObservable()
    
	constructor(private activatedRoute: ActivatedRoute, private trainingService: StudentTrainingService, private studentProfileService: StudentProfileService) {}

	ngOnInit(): void {
		this.activatedRoute.paramMap.subscribe((params) => {
			const profileId = params.get('id');
			console.log('student profile page', profileId);
			if (profileId) {
                this.trainingService.getProfile(profileId, {
                    include: ['progress']
                }).subscribe(profileInfo => {
                    this.viewDataStore$.next({
                        ...profileInfo,
                        mode: ViewMode.SingleProfile
                    })
                })
			} else {
                this.viewDataStore$.next({
                    mode: ViewMode.ProfilesList
                })
            }
		});
	}
}
