import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	BehaviorSubject,
	catchError,
	map,
	Observable,
	of,
	Subscription,
	switchMap,
	throwError,
	withLatestFrom,
	combineLatest,
	shareReplay,
	take,
	tap,
	filter,
} from 'rxjs';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { UserService } from 'src/app/services/user.service';
import { CourseCompetency, CourseModule } from 'src/app/typings/course.types';
import { Training, TrainingMembershipStatus, TrainingProfile, TrainingProfileMeta } from 'src/app/typings/training.types';
import { LearnService } from '../../services/learn.service';
import { ConfigService } from 'src/app/services/config.service';
import { StudentTraining } from 'src/app/models/course.model';

@Component({
	selector: 'app-course-overview',
	templateUrl: './course-overview.component.html',
	styleUrls: ['./course-overview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent {
	private enrollmentSub?: Subscription;
	private courseEnrollTrigger$ = new BehaviorSubject<void>(undefined);
	private competenciesConfig$: Observable<CourseCompetency[]>

	public training$: Observable<StudentTraining | null>;

	// public modules$: Observable<CourseModule[]>;

	public competenciesDiff$: Observable<string[]>;
	public canEnroll$: Observable<boolean>;
	public isUserOwner$: Observable<boolean>;
	public trainingLookup$: Observable<TrainingProfileMeta | 'NoEnroll'> | null = null
	public competenciesConfig: CourseCompetency[] | null = null

	public isDisabledEnrollActions = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
    private learnService: LearnService,
		private configService: ConfigService,
	) {
		this.competenciesConfig$ = this.configService.loadCourseCompetencies()
		
		this.training$ = this.competenciesConfig$.pipe(
			switchMap(config => {
				this.competenciesConfig = config
				return this.activatedRoute.paramMap
			}),
			switchMap((paramMap) => {
				const id = String(paramMap.get('id'));
				if (id) {
					return this.learnService.getTraining(id);
				}
				return of(null);
			}),
			map((res) => (res ? new StudentTraining(res[0]) : null)),
			shareReplay(1)
		);

		this.isUserOwner$ = this.training$.pipe(
			switchMap((training) => {
				if (training) {
					return this.userService.isCourseOwner(training.course);
				}
				return of(false);
			})
		);

		this.competenciesDiff$ = this.competenciesConfig$.pipe(
			withLatestFrom(this.userService.user$, this.training$),
			map(([competencies, user, training]) => {
				const userComps = user.trainingProfile.competencies
				const diff = training?.course.competencies.required.reduce((diff, comp) => {
					if (!userComps.includes(comp)) {
						diff.push(comp)
					}
					return diff
				}, [] as string[]) ?? []
				return diff.map(compKey => competencies.find(c => c.id === compKey)).filter(Boolean).map(comp => comp!.label);
			}),
			tap(diff => {
				this.isDisabledEnrollActions = diff.length > 0
			})
		)

		this.canEnroll$ = this.userService.user$.pipe(
			withLatestFrom(this.isUserOwner$),
			map(([user, isOwner]) => {
				return user?.role !== 'admin' && !isOwner;
			})
		);

  			this.trainingLookup$ = combineLatest([
			this.courseEnrollTrigger$.asObservable(),
			this.training$,
			this.userService.user$,
		]).pipe(
						switchMap(([_, training, user]) => {
				if (training && user) {
					return this.learnService.lookupTraining(
						[user._id],
						training._id
					);
				}
				return of(null);
			}),
						map(lookup => {
								if (lookup && lookup.length > 0) {
										return lookup[0]
								}
								return 'NoEnroll';
						}),
						shareReplay(1)
			)
	}

	public enrollTraining(training: Training): void {
		this.makeCourseEnrollAction(training._id, NetworkRequestKey.CreateTrainingEnroll);
	}

	public cancelTrainingEnroll(training: Training): void {
		this.makeCourseEnrollAction(
            training._id,
            NetworkRequestKey.UpdateTrainingEnroll,
        );
	}

	public leaveTraining(training: Training) {
		this.makeCourseEnrollAction(
			training._id,
			NetworkRequestKey.DeleteTrainingEnroll
		);
	}

	public getCompLabel(id: string) {
		return this.competenciesConfig?.find(comp => comp.id === id)?.label ?? ''
	}

	private makeCourseEnrollAction(trainingId: string, key: string): void {
		this.isDisabledEnrollActions = true;
		if (this.enrollmentSub && !this.enrollmentSub.closed) {
			return;
		}
		this.enrollmentSub = this.userService.user$
			.pipe(
				switchMap((user) => {
					if (user) {
						return this.learnService.changeProfileEnrollment(
							[user._id],
							trainingId,
							key
						);
					}
					return throwError(() => new Error('No user'));
				}),
				catchError((err) => {
					return throwError(() => new Error(err.error.message));
				})
			)
			.subscribe({
				next: (res) => {
					console.log('Perform course enroll action', res);
					this.courseEnrollTrigger$.next();
					this.enrollmentSub?.unsubscribe();
					this.isDisabledEnrollActions = false;
				},
				error: (err) => {
					console.warn(err);
					this.enrollmentSub?.unsubscribe();
					this.isDisabledEnrollActions = false;
				},
			});
	}
}
