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
	filter,
} from 'rxjs';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { UserService } from 'src/app/services/user.service';
import { Course, CourseCompetency, CourseFeedback } from 'src/app/typings/course.types';
import { Training, TrainingProfileMeta } from 'src/app/typings/training.types';
import { LearnService } from '../../services/learn.service';
import { ConfigService, CourseCategory } from 'src/app/services/config.service';
import { StudentTraining } from 'src/app/models/course.model';
import { FormBuilder, Validators } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { User } from 'src/app/typings/user.types';
import { constructCourseTree } from 'src/app/helpers/courses.helper';
import { apiUrl } from 'src/app/constants/urls';

type ViewData = {
	course: Course | null
	trainings: Training[] | null
	activeTraining: StudentTraining | null
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
	private activeTraining: Training | null = null

	public viewData$!: Observable<ViewData | null>
	public course$!: Observable<Course | null>

	public trainingLookup$: Observable<
		TrainingProfileMeta | 'NoEnroll'
	> | null = null;
	public competenciesConfig: CourseCompetency[] | null = null;

	public isDisabledEnrollActions = false;

	public feedbackForm = this.fb.group({
		text: ['', Validators.required],
		rating: [null]
	})
	public fallbackBanner = `${apiUrl}/static/images/course-bg-1.jpg`
	private categories: CourseCategory[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private learnService: LearnService,
		private configService: ConfigService,
		private feedbackService: FeedbackService,
		private fb: FormBuilder,
	) { }

	public ngOnInit(): void {
		const course$ = this.activatedRoute.paramMap.pipe(
			switchMap((paramMap) => {
				const id = String(paramMap.get('id'));
				if (id) {
					return this.learnService.getCourse(id);
				}
				return of(null);
			}),
			map(res => res ? res.data[0] : null),
			tap(course => {
				if (course) {
					course.contentTree = constructCourseTree(course)
				}
			}),
			shareReplay(1)
		);

		const trainings$ = course$.pipe(
			switchMap(course => {
				return course ? this.learnService.getCourseTrainings(course.uuid) : of(null)
			}),
			map(trainings => {
				this.activeTraining = trainings?.find(t => t.status === 'active') ?? null
				return trainings ? trainings : null
			}),
			shareReplay(1)
		)

		const competenciesDiff$ = combineLatest([
			this.configService.competencies$,
			this.userService.user$, 
			course$,			
		]).pipe(
			map(([competencies, user, course]) => {
				const userComps = user.trainingProfile.competencies;
				if (!course?.competencies.required) {
					return []
				}
				const diff =
					course?.competencies.required.reduce(
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
			trainings$,
			this.userService.user$,
		]).pipe(
			switchMap(([_, training, user]) => {
				if (this.activeTraining && user) {
					return this.learnService.lookupTraining(
						[user._id],
						this.activeTraining._id
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

		const initialFeedbacks$ = course$.pipe(
			switchMap(course => {
				if (course) {
					return this.feedbackService.getCourseFeedbacks(course._id)
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
			trainings$,
			course$,
			competenciesDiff$,
			trainingLookup$,
			this.configService.competencies$,
			this.userService.user$,
			feedbacks$,
			this.configService.loadCourseCategories(),
		]).pipe(
			map(([
				trainings,
				course,
				compDiff,
				trainingLookup,
				competenciesConfig,
				user,
				feedbacks,
				categories,
			]) => {				
				const isOwner = user.permission === 'teacher' && user.uuid === course?.authorId

				const userTrainings = user.trainingProfile.trainingHistory as string[]
				const activeTraining = trainings?.find(t => t.status === 'active') ?? null
				
				const isUserPassedCourseTraining = trainings?.filter(training => userTrainings.includes(training._id) && training.status === 'archived');

				const canAddReview = isUserPassedCourseTraining ? isUserPassedCourseTraining.length > 0 && !isOwner : false
				this.competenciesConfig = competenciesConfig

				this.categories = categories

				return {
					course,
					trainings,
					activeTraining: activeTraining ? new StudentTraining(activeTraining) : null,
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

	public getCategory(id: string) {
		return this.categories.find(c => c.key === id)?.name
	}

	public onSendFeedback(viewData: ViewData) {
		if (!this.feedbackForm.valid) {
			console.warn('Form is invalid');
			return;
		}
		const { text, rating } = this.feedbackForm.value
		const { trainings, course, user } = viewData

		if (!course) {
			console.warn('No course found.');
			return;
		}

		if (text) {
			this.feedbackService.postCourseFeedback({
				text,
				rating: Number(rating),
				authorId: user._id,
				courseId: course._id,
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
