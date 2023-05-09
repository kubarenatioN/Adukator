import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Observable, ReplaySubject } from 'rxjs';
import { createTopicsProgressConfig } from 'src/app/helpers/charts.config';
import { StudentTraining } from 'src/app/models/course.model';
import {
	Personalization,
	ProfileProgress,
	TrainingProfileTraining,
} from 'src/app/typings/training.types';
import { StudentProfileService } from '../../services/student-profile.service';
import { StudentTrainingService } from '../../services/student-training.service';
import { TopicTask } from 'src/app/typings/course.types';

enum ViewMode {
	SingleProfile = 'SingleProfile',
	ProfilesList = 'ProfilesList',
}

type ViewData = {
	mode: ViewMode;
	profile?: TrainingProfileTraining | null;
	training: StudentTraining | null;
	hasAccess?: boolean;
	topicsProgress?: ProfileProgress[];
	charts: {
		topics?: ChartConfiguration<'line', any, string>;
	};
};

@Component({
	selector: 'app-student-profile',
	templateUrl: './student-profile.component.html',
	styleUrls: ['./student-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {
	private viewDataStore$ = new ReplaySubject<ViewData>();

	public viewData$: Observable<ViewData> = this.viewDataStore$.asObservable();

	constructor(
		private activatedRoute: ActivatedRoute,
		private trainingService: StudentTrainingService,
		private studentProfileService: StudentProfileService
	) {}

	ngOnInit(): void {
		this.activatedRoute.paramMap.subscribe((params) => {
			const profileId = params.get('id');
			console.log('student profile page', profileId);
			if (profileId) {
				this.trainingService
					.getProfile(profileId, {
						include: ['progress', 'personalization'],
					})
					.subscribe((profileInfo) => {
						const training = profileInfo.profile?.training
							? new StudentTraining(profileInfo.profile.training)
							: null;
						const progress = profileInfo.progress;
						const personalTasks = profileInfo.personalization
							?.filter((pers) => pers.type === 'assignment')
							.map((pers) => pers.task!);

						this.viewDataStore$.next({
							...profileInfo,
							training,
							topicsProgress: progress,
							mode: ViewMode.SingleProfile,
							charts: {
								topics:
									training && progress
										? createTopicsProgressConfig(
												training.topics,
												progress,
												personalTasks
										  )
										: undefined,
							},
						});
					});
			} else {
				this.viewDataStore$.next({
					mode: ViewMode.ProfilesList,
					training: null,
					charts: {},
				});
			}
		});
	}
}
