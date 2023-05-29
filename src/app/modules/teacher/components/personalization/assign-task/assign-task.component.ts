import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
	map,
	shareReplay,
	switchMap,
	tap,
	withLatestFrom,
} from 'rxjs/operators';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { generateUUID } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { StudentTraining } from 'src/app/models/course.model';
import { ModuleTopic } from 'src/app/typings/course.types';
import {
	PersonalTask,
	TrainingProfilePersonalizations,
} from 'src/app/typings/training.types';
import { PersonalizationService } from '../../../services/personalization.service';
import { TeacherTrainingService } from '../../../services/teacher-training.service';
import { UserService } from 'src/app/services/user.service';

export type PersonalizationProfile = {
	profile: TrainingProfilePersonalizations;
	hasAssignedTask: boolean;
};

@Component({
	selector: 'app-assign-task',
	templateUrl: './assign-task.component.html',
	styleUrls: ['./assign-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignTaskComponent implements OnInit {
	private profiles$!: Observable<TrainingProfilePersonalizations[]>;
	private tasks: PersonalTask[] = [];
	private refreshProfiles$ = new BehaviorSubject<void>(undefined);

	public trainings$ = this.teacherService
		.getTeacherTrainings(CoursesSelectFields.Modules)
		.pipe(
			map(trainings => trainings.filter(t => t.status === 'active')),
			shareReplay(1)
		);
	public topics$!: Observable<ModuleTopic[] | null>;
	public tasks$!: Observable<PersonalTask[] | null | 'NoTasks'>;
	public personalizations$!: Observable<PersonalizationProfile[]>;

	public form;
	public canAssign = false;

	constructor(
		private teacherService: TeacherTrainingService,
		private personalizationService: PersonalizationService,
		private userService: UserService,
		private fbHelper: FormBuilderHelper
	) {
		this.form = this.fbHelper.createAssignTaskForm();

		this.form.valueChanges.subscribe((model) => {
			// console.log(model);
			this.canAssign =
				!!(
					model.task &&
					model.topic &&
					model.training &&
					model.personalizations
				) && this.form.controls.personalizations.dirty;
		});
	}

	ngOnInit(): void {
		const personalTasks$ = this.personalizationService.getTeacherTasks();

		this.topics$ = this.form.controls.training.valueChanges.pipe(
			withLatestFrom(this.trainings$),
			map(([trainingId, trainings]) => {
				const training = trainings.find((t) => t._id === trainingId);
				return training ? new StudentTraining(training).topics : null;
			}),
			tap(() => {
				this.form.controls.topic.setValue('', { onlySelf: true });
			})
		);

		this.profiles$ = combineLatest([
			this.refreshProfiles$,
			this.form.controls.training.valueChanges,
		]).pipe(
			switchMap(([_, trainingId]) => {
				if (trainingId) {
					return this.teacherService
						.getTrainingProfiles(trainingId, {
							include: ['personalization'],
						})
						.pipe(map((res) => res.profiles));
				}
				return of(null);
			}),
			map((profiles) =>
				profiles ? (profiles as TrainingProfilePersonalizations[]) : []
			)
		);

		this.form.controls.topic.valueChanges.subscribe((topic) => {
			this.form.controls.task?.setValue('', { onlySelf: true });
		});

		this.tasks$ = combineLatest([
			this.form.valueChanges,
			personalTasks$,
		]).pipe(
			map(([model, tasks]) => {
				const { training, topic } = model;
				if (training && topic) {
					const personalTasks = tasks.filter(
						(task) =>
							task.training._id === model.training &&
							task.topicId === model.topic
					);
					this.tasks = personalTasks;
					return personalTasks.length > 0 ? personalTasks : 'NoTasks';
				}
				return null;
			})
		);

		this.personalizations$ = combineLatest([
			this.form.controls.task.valueChanges,
			this.profiles$,
		]).pipe(
			map(([taskId, profiles]) => {
				this.form.controls.personalizations.clear();
				const { training, topic } = this.form.value;

				const assigments =
					!taskId || !training || !topic
						? []
						: profiles?.map((profile) => {
								const hasAssignedTask =
									profile.personalizations.findIndex(
										(p) =>
											p.type === 'assignment' &&
											p.task?.uuid === taskId
									) > -1;
								return {
									profile,
									hasAssignedTask,
								};
						  });

				const items = assigments.map((a) =>
					this.fbHelper.fbRef.group(a)
				);
				// const items = this.fbHelper.fbRef.array(assigments.map(a => this.fbHelper.fbRef.group(a)))

				items.forEach((item) => {
					this.form.controls.personalizations.push(item);
				});

				return assigments;
			}),
			shareReplay(1)
		);
	}

	public onAssign() {
		const { training, topic, task, personalizations } = this.form.value;

		if (
			!training ||
			!topic ||
			!task ||
			!personalizations ||
			personalizations.length === 0
		) {
			console.warn('Invalid form.');
			return;
		}

		const taskId = this.tasks.find((t) => t.uuid === task)?._id;
		if (!taskId) {
			console.warn('No task for given uuid found.');
			return;
		}

		// console.log(personalizations);
		const profiles = (personalizations as PersonalizationProfile[]).map(
			(pers) => {
				return {
					uuid: generateUUID(),
					profile: pers.profile._id,
					task: taskId,
					taskPersonalization: pers.profile.personalizations.find(
						(pers) =>
							pers.type === 'assignment' &&
							pers.task?._id === taskId
					)?.uuid,
					isAssigned: pers.hasAssignedTask,
				};
			}
		);

		const payload = profiles.reduce(
			(acc, profile) => {
				if (profile.isAssigned && !profile.taskPersonalization) {
					acc.assign.push(profile);
				} else if (!profile.isAssigned && profile.taskPersonalization) {
					acc.unassign.push(profile);
				}
				return acc;
			},
			{
				assign: new Array<(typeof profiles)[0]>(),
				unassign: new Array<(typeof profiles)[0]>(),
			}
		);

		if (payload.assign.length === 0 && payload.unassign.length === 0) {
			console.log('No assignment changes');
			return;
		}

		this.canAssign = false;
		this.form.controls.personalizations.disable();

		this.personalizationService.applyTasksAssignment(payload).subscribe({
			next: (res) => {
				this.refreshProfiles$.next();
				// this.form.controls.personalizations.enable()
				this.form.controls.personalizations.markAsPristine();
				this.canAssign = true;
			},
			error: (err) => {
				console.error('Assignment error', err);
				this.canAssign = true;
			},
		});
	}
}
