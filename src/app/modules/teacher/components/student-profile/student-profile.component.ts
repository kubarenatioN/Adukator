import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import {
	distinctUntilChanged,
	map,
	switchMap,
	take,
	takeUntil,
	tap,
} from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { createTopicsProgressConfig } from 'src/app/helpers/charts.config';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { StudentTraining } from 'src/app/models/course.model';
import {
	ProfileProgress,
	Training,
	TrainingProfileTraining,
	TrainingProfileUser,
} from 'src/app/typings/training.types';
import { TeacherTrainingService } from '../../services/teacher-training.service';

type ViewData = {
	profile: TrainingProfileTraining | null;
	progress?: ProfileProgress[];
	hasAccess: boolean;
	training: StudentTraining | null;
	charts: {
		[key: string]: any;
	};
};

@Component({
	selector: 'app-student-profile',
	templateUrl: './student-profile.component.html',
	styleUrls: ['./student-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent
	extends CenteredContainerDirective
	implements OnInit
{
	private activeProfileStore$ = new ReplaySubject<string>(1);
	private profilesStore$ = new ReplaySubject<TrainingProfileUser[] | null>(1);

	public viewData$!: Observable<ViewData | null>;

	public filtersForm;
	public trainings: Training[] = [];
	public profiles$ = this.profilesStore$.asObservable();

	private trainingControl;
	private studentControl;

	constructor(
		private fbHelper: FormBuilderHelper,
		private teacherTrainingService: TeacherTrainingService,
		private cd: ChangeDetectorRef
	) {
		super();

		this.filtersForm = this.fbHelper.fbRef.group({
			training: '',
			student: '',
		});
		this.trainingControl = this.filtersForm.controls.training;
		this.studentControl = this.filtersForm.controls.student;
	}

	ngOnInit(): void {
		this.trainingControl.valueChanges
			.pipe(
				takeUntil(this.componentLifecycle$),
				tap(() => {
					this.studentControl.disable();
				}),
				switchMap((training) => {
					return this.loadTrainingProfiles(training);
				})
			)
			.subscribe((profiles) => {
				if (profiles && profiles.length > 0) {
					this.profilesStore$.next(profiles);
					this.studentControl.setValue(profiles[0].uuid);
				} else {
					this.profilesStore$.next(null);
				}
				this.studentControl.enable();
			});

		this.teacherTrainingService.trainings$
			.pipe(take(1))
			.subscribe((trainings) => {
				if (trainings.length === 0) {
					console.log('No trainings available');
					return;
				}
				this.trainings = trainings;
				this.filtersForm.patchValue({
					training: trainings[0]._id,
				});
				this.cd.detectChanges();
			});

		this.studentControl.valueChanges
			.pipe(takeUntil(this.componentLifecycle$))
			.subscribe((profileId) => {
				if (profileId) {
					this.activeProfileStore$.next(profileId);
				}
			});

		this.viewData$ = this.activeProfileStore$.asObservable().pipe(
			takeUntil(this.componentLifecycle$),
			distinctUntilChanged(),
			switchMap((profileId) => {
				return this.loadProfileProgress(profileId);
			}),
			map((res) => {
				const training = res.profile
					? new StudentTraining(res.profile.training)
					: null;
				const personalTasks = res?.personalization
					?.filter((pers) => pers.type === 'assignment')
					.map((pers) => pers.task!);
				return {
					profile: res.profile,
					hasAccess: res.hasAccess,
					progress: res.progress,
					training,
					charts: {
						topics:
							training && res.progress
								? createTopicsProgressConfig(
										training.topics,
										res.progress,
										personalTasks
								  )
								: null,
					},
				};
			})
		);

		this.viewData$.subscribe((res) => {
			// console.log(res);
		});
	}

	public getTaskMark(
		taskId: string,
		topicId: string,
		progress: ProfileProgress[]
	) {
		const topicProgress = progress.find((p) => p.topicId === topicId)!;
		const marks = topicProgress.records
			.filter((record) => record.taskId === taskId)
			.map((record) => record.mark ?? 0);
		return marks.length > 0 ? Math.max(...marks) : 0;
	}

	private loadTrainingProfiles(trainingId: string | null) {
		if (trainingId) {
			return this.teacherTrainingService
				.getTrainingProfiles(trainingId)
				.pipe(
					map((res) =>
						res.profiles && res.profiles.length > 0
							? res.profiles
							: null
					)
				);
		}
		return of(null);
	}

	private loadProfileProgress(profileId: string) {
		return this.teacherTrainingService.getProfile(profileId, {
			include: ['progress'],
		});
	}
}
