import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeacherTrainingService } from '../../services/teacher-training.service';

@Component({
	selector: 'app-student-profile',
	templateUrl: './student-profile.component.html',
	styleUrls: ['./student-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {
	constructor(private activatedRoute: ActivatedRoute, private teacherTrainingService: TeacherTrainingService) {

    }

	ngOnInit(): void {
		this.activatedRoute.paramMap.subscribe((params) => {
			const profileId = params.get('id');
			console.log('student profile page', profileId);
			if (profileId) {
                this.teacherTrainingService.getProfile(profileId, {
                    include: ['progress']
                }).subscribe(profileInfo => {
                    this.viewDataStore$.next({
                        ...profileInfo,
                        training: profileInfo.profile?.training 
                            ? new StudentTraining(profileInfo.profile.training) 
                            : undefined,
                        topicsProgress: profileInfo.progress,
                        mode: ViewMode.SingleProfile,
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
