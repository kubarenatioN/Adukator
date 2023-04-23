import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StudentTraining } from 'src/app/models/course.model';
import { ProfileProgress, TrainingProfileTraining } from 'src/app/typings/training.types';
import { TeacherTrainingService } from '../../services/teacher-training.service';

type ViewData = {
    profile: TrainingProfileTraining | null
    progress?: ProfileProgress[],
    hasAccess: boolean,
    training: StudentTraining | null
}

@Component({
	selector: 'app-student-profile',
	templateUrl: './student-profile.component.html',
	styleUrls: ['./student-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {    
    public viewData$!: Observable<ViewData | null>

	constructor(private activatedRoute: ActivatedRoute, private teacherTrainingService: TeacherTrainingService) {

    }

	ngOnInit(): void {
		this.viewData$ = this.activatedRoute.paramMap.pipe(
            switchMap(params => {
                const profileId = params.get('profileId');
                console.log('student profile page', profileId);
                if (profileId) {
                    return this.teacherTrainingService.getProfile(profileId, {
                        include: ['progress']
                    })
                }
                return of(null)
            }),
            map(profileInfo => {
                return profileInfo ? {
                    ...profileInfo,
                    training: profileInfo.profile?.training ? new StudentTraining(profileInfo.profile.training) : null
                } : null
            })
        )
	}
}
