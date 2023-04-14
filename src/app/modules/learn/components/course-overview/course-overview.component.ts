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
} from 'rxjs';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { UserService } from 'src/app/services/user.service';
import { CourseModule } from 'src/app/typings/course.types';
import { Training, TrainingMembershipStatus, TrainingProfile } from 'src/app/typings/training.types';
import { LearnService } from '../../services/learn.service';

@Component({
	selector: 'app-course-overview',
	templateUrl: './course-overview.component.html',
	styleUrls: ['./course-overview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent {
	private enrollmentSub?: Subscription;
	private courseEnrollTrigger$ = new BehaviorSubject<void>(undefined);

	public training$: Observable<Training | null>;

	public modules$: Observable<CourseModule[]>;

	public canEnroll$: Observable<boolean>;
	public isEnrolled$: Observable<boolean>;
	public enrollStatus$: Observable<TrainingMembershipStatus | null>;
	public isUserOwner$: Observable<boolean>;

	public isDisabledEnrollActions = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
        private learnService: LearnService,
	) {
		this.training$ = this.activatedRoute.paramMap.pipe(
			switchMap((paramMap) => {
				const id = String(paramMap.get('id'));
				if (id) {
					return this.learnService.getTraining(id);
				}
				return of(null);
			}),
			map((res) => (res ? res[0] : null)),
			shareReplay(1)
		);

		this.modules$ = this.training$.pipe(
			map((training) => (training ? training.course.modules : []))
		);

		this.isUserOwner$ = this.training$.pipe(
			switchMap((training) => {
				if (training) {
					return this.userService.isCourseOwner(training.course);
				}
				return of(false);
			})
		);

		this.canEnroll$ = this.userService.user$.pipe(
			withLatestFrom(this.isUserOwner$),
			map(([user, isOwner]) => {
				return user?.role !== 'admin' && !isOwner;
			})
		);

		const courseEnrollmentStatus$ = combineLatest([
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
			withLatestFrom(this.userService.user$),
			map(([lookup, user]) => {
				if (lookup === null) {
					return null;
				}
				const userEnrollmentIndex = lookup.findIndex(
					(record) => record.student === user._id
				);
				if (userEnrollmentIndex !== -1) {
					return lookup[userEnrollmentIndex].enrollment;
				}
				return null;
			}),
			shareReplay(1)
		);

		this.enrollStatus$ = courseEnrollmentStatus$;

		this.isEnrolled$ = this.enrollStatus$.pipe(
			map((status) => status !== null),
            shareReplay(1),
		);
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
