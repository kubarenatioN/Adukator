import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import {
	distinctUntilChanged,
	map,
	shareReplay,
	switchMap,
	take,
	takeUntil,
	tap,
} from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { createTopicsProgressConfig } from 'src/app/helpers/charts.config';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import {
	Personalization,
	ProfileProgress,
	Training,
	TrainingProfileFull,
	TrainingProfileTraining,
	TrainingProfileUser,
} from 'src/app/typings/training.types';
import { TeacherTrainingService } from '../../services/teacher-training.service';

type ViewData = {
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
	private activeProfileStore$ = new ReplaySubject<string[]>(1);
	private profilesStore$ = new ReplaySubject<TrainingProfileUser[] | null>(1);
	private profilesProgressStore$ = new ReplaySubject<{
		profile: TrainingProfileFull | null;
		progress?: ProfileProgress[];
		personalization?: Personalization[];
	}[] | null>(1);

	public viewData$!: Observable<ViewData | null>;

	public filtersForm;
	public trainings: Training[] = [];
	public profiles$ = this.profilesStore$.asObservable();
	public profilesProgress$ = this.profilesProgressStore$.asObservable();

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
			student: [new Array<string>()],
		});
		this.trainingControl = this.filtersForm.controls.training;
		this.studentControl = this.filtersForm.controls.student;
	}

	ngOnInit(): void {
		this.trainingControl.valueChanges
			.pipe(
				takeUntil(this.componentLifecycle$),
				tap(() => {
					this.studentControl.setValue([]);
					this.studentControl.disable();
				}),
				switchMap((training) => {
					return this.loadTrainingProfiles(training);
				})
			)
			.subscribe((profiles) => {
				if (profiles && profiles.length > 0) {
					this.profilesStore$.next(profiles);
					this.preparePfofilesProgress(profiles.map(p => p.uuid))
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
			.subscribe((profilesId) => {
				
				if (profilesId) {
					this.activeProfileStore$.next(profilesId);
				}
			});

		this.viewData$ = combineLatest([
			this.activeProfileStore$,
			this.profilesProgress$,
		])
		.pipe(
			takeUntil(this.componentLifecycle$),
			distinctUntilChanged(),
			map(([students, res]) => {
				
				if (!res) {
					return null
				}

				const activeProfiles = res.filter(p => students.includes(p.profile?.uuid ?? ''))

				return {
					charts: {
						topics: createTopicsProgressConfig(activeProfiles)
					},
				};
			}),
			shareReplay(1),
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
		const topicProgress = progress.find((p) => p.topicId === topicId);
		if (!topicProgress) {
			return 0;
		}
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

	private preparePfofilesProgress(profiles: string[]) {
		this.loadProfileProgress(profiles).subscribe(data => {
			this.profilesProgressStore$.next(data.result);
		})
	}

	private loadProfileProgress(profiles: string[]) {
		return this.teacherTrainingService.getProfiles(profiles, {
			include: ['progress'],
		});
	}
}
