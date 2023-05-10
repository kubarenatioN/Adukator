import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
	combineLatest,
	shareReplay,
	tap,
} from 'rxjs';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseCompetency, CourseFeedback } from 'src/app/typings/course.types';
import { Training, TrainingProfileMeta } from 'src/app/typings/training.types';
import { LearnService } from '../../services/learn.service';
import { ConfigService } from 'src/app/services/config.service';
import { StudentTraining } from 'src/app/models/course.model';
import { FormBuilder, Validators } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { User } from 'src/app/typings/user.types';

type ViewData = {
	course: Course
	training: StudentTraining
	competenciesDiff: string[]
	trainingLookup: TrainingProfileMeta | null | 'NoEnroll'
	isUserOwner: boolean
	canEnroll: boolean
	user: User
	canAddReview: boolean
	competenciesConfig: CourseCompetency[]
	feedbacks: CourseFeedback[] | null,
}

@Component({
	selector: 'app-course-overview',
	templateUrl: './course-overview.component.html',
	styleUrls: ['./course-overview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent implements OnInit {
	private enrollmentSub?: Subscription;
	private courseEnrollTrigger$ = new BehaviorSubject<void>(undefined);
	private feedbacksRefresh$ = new BehaviorSubject<CourseFeedback[]>([])

	public viewData$!: Observable<ViewData | null>

	public trainingLookup$: Observable<
		TrainingProfileMeta | 'NoEnroll'
	> | null = null;
	public competenciesConfig: CourseCompetency[] | null = null;

	public isDisabledEnrollActions = false;

	public feedbackForm = this.fb.group({
		text: ['', Validators.required],
		rating: [null]
	})

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private learnService: LearnService,
		private configService: ConfigService,
		private feedbackService: FeedbackService,
		private fb: FormBuilder,
	) { }

	public ngOnInit(): void {
		const training$ = this.configService.competencies$.pipe(
			switchMap((config) => {
				this.competenciesConfig = config;
				return this.activatedRoute.paramMap;
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

		const competenciesDiff$ = combineLatest([
			this.configService.competencies$,
			this.userService.user$, 
			training$,			
		]).pipe(		
			map(([competencies, user, training]) => {
				const userComps = user.trainingProfile.competencies;
				const diff =
					training?.course.competencies.required.reduce(
						(diff, comp) => {
							if (!userComps.includes(comp)) {
								diff.push(comp);
							}
							return diff;
						},
						[] as string[]
					) ?? [];
				return diff
					.map((compKey) =>
						competencies.find((c) => c.id === compKey)
					)
					.filter(Boolean)
					.map((comp) => comp!.label);
			}),
			tap((diff) => {
				this.isDisabledEnrollActions = diff.length > 0;
			})
		);

		const trainingLookup$ = combineLatest([
			this.courseEnrollTrigger$.asObservable(),
			training$,
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
			map((lookup) => {
				if (lookup && lookup.length > 0) {
					return lookup[0];
				}
				return 'NoEnroll';
			}),
			shareReplay(1)
		);

		const initialFeedbacks$ = training$.pipe(
			switchMap(training => {
				if (training) {
					return this.feedbackService.getCourseFeedbacks(training.course._id, training._id)
				}
				return of(null)
			}),
			catchError(err => {
				return of(null)
			}),
			map(res => {
				return res ? res.data : null
			})
		)

		const feedbacks$ = combineLatest([
			initialFeedbacks$,
			this.feedbacksRefresh$
		]).pipe(
			map(([ feedbacks, refreshFeedbacks ]) => {
				if (feedbacks) {
					if (refreshFeedbacks.length > 0) {
						feedbacks.unshift(...refreshFeedbacks)
						return feedbacks
					}
					return feedbacks
				}
				return null
			})
		)

		this.viewData$ = combineLatest([
			training$,
			competenciesDiff$,
			trainingLookup$,
			this.configService.competencies$,
			this.userService.user$,
			feedbacks$,
		]).pipe(
			map(([
				training,
				compDiff,
				trainingLookup,
				competenciesConfig,
				user,
				feedbacks
			]) => {
				if (!training) {
					return null
				}
				
				const isOwner = user.permission === 'teacher' && user.uuid === training.course.authorId
				const canAddReview = (user.trainingProfile.trainingHistory as string[]).includes(training._id) && !isOwner

				return {
					course: training.course,
					training,
					competenciesDiff: compDiff,
					trainingLookup,
					isUserOwner: isOwner,
					canEnroll: user.role !== 'admin' && !isOwner,
					user,
					canAddReview,
					competenciesConfig,
					feedbacks,
				}
			})
		)
	}

	public enrollTraining(training: Training): void {
		this.makeCourseEnrollAction(
			training._id,
			NetworkRequestKey.CreateTrainingEnroll
		);
	}

	public cancelTrainingEnroll(training: Training): void {
		this.makeCourseEnrollAction(
			training._id,
			NetworkRequestKey.DeleteTrainingEnroll
		);
	}

	public leaveTraining(training: Training) {
		this.makeCourseEnrollAction(
			training._id,
			NetworkRequestKey.DeleteTrainingEnroll
		);
	}

	public getCompLabel(id: string) {
		return (
			this.competenciesConfig?.find((comp) => comp.id === id)?.label ?? ''
		);
	}

	public getTrainingDuration(course: Course) {
		const days = course.topics.reduce((days, topic) => {
			return days + topic.duration;
		}, 0);

		return `Недель: ${Math.floor(days / 7)}`;
	}

	public onSendFeedback(viewData: ViewData) {
		if (!this.feedbackForm.valid) {
			console.warn('Form is invalid');
			return;
		}

		const { text, rating } = this.feedbackForm.value
		const { training, course, user } = viewData
		if (text) {
			this.feedbackService.postCourseFeedback({
				text,
				rating: Number(rating),
				authorId: user._id,
				courseId: course._id,
				trainingId: training._id
			}).subscribe(res => {
				this.feedbackForm.reset()
				const { created } = res
				this.feedbacksRefresh$.next([created])
			})
		}
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
