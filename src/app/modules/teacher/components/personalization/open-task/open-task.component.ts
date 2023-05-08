import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
	map,
	shareReplay,
	startWith,
	switchMap,
	tap,
	withLatestFrom,
} from 'rxjs/operators';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { generateUUID } from 'src/app/helpers/courses.helper';
import { FormBuilderHelper } from 'src/app/helpers/form-builder.helper';
import { StudentTraining } from 'src/app/models/course.model';
import { ModuleTopic, TopicTask } from 'src/app/typings/course.types';
import {
	PersonalTask,
	Training,
	TrainingProfilePersonalizations,
	TrainingProfileUser,
} from 'src/app/typings/training.types';
import { PersonalizationService } from '../../../services/personalization.service';
import { TeacherTrainingService } from '../../../services/teacher-training.service';
import { UserService } from 'src/app/services/user.service';

export type OpeningPersonalization = {
	profile: TrainingProfilePersonalizations;
  persId: string | null
  hasOpening: boolean
};

@Component({
	selector: 'app-open-task',
	templateUrl: './open-task.component.html',
	styleUrls: ['./open-task.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenTaskComponent implements OnInit {
	private profiles$!: Observable<TrainingProfilePersonalizations[]>;
	private tasks: TopicTask[] = [];
	private refreshProfiles$ = new BehaviorSubject<void>(undefined);
  private currentTraining: Training | null = null

	public trainings$ = this.teacherService
		.getTeacherTrainings(CoursesSelectFields.Modules)
		.pipe(shareReplay(1));

	public topics$!: Observable<ModuleTopic[] | null>;
	public tasks$!: Observable<TopicTask[] | null>;
	public personalizations$!: Observable<OpeningPersonalization[]>;

	public form;
	public isListChanged = false;

	constructor(
		private teacherService: TeacherTrainingService,
		private personalizationService: PersonalizationService,
		private userService: UserService,
		private fbHelper: FormBuilderHelper
	) {
		this.form = this.fbHelper.createAssignTaskForm();

		this.form.valueChanges.subscribe((model) => {
			// console.log(model);
			this.isListChanged =
				!!(
					model.task &&
					model.topic &&
					model.training &&
					model.personalizations
				) && this.form.controls.personalizations.dirty;
		});
	}

	ngOnInit(): void {
		this.topics$ = this.form.controls.training.valueChanges.pipe(
			withLatestFrom(this.trainings$),
			map(([trainingId, trainings]) => {
				const training = trainings.find((t) => t._id === trainingId);
        this.currentTraining = training ?? null
				return training ? new StudentTraining(training).topics : null;
			}),
			tap(() => {
				this.form.controls.topic.setValue('', { onlySelf: true });
			})
		);

    this.tasks$ = this.form.controls.topic.valueChanges
		.pipe(
			map((topicId) => {
        const tasks = this.currentTraining?.course.topics.find(topic => topic.id === topicId)?.practice?.tasks
        this.tasks = tasks ?? []
        return tasks && tasks.length > 0 ? tasks : null
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

		this.personalizations$ = combineLatest([
			this.form.controls.task.valueChanges,
			this.profiles$,
		]).pipe(
			map(([taskId, profiles]) => {
				this.form.controls.personalizations.clear();
				const { training, topic } = this.form.value;

				const openings = !taskId || !training || !topic
						? []
						: profiles?.map((profile) => {

                const pers = profile.personalizations.find(
                  (p) =>
                    p.type === 'opening' &&
                    p.opening === taskId
                );
                
								return {
									profile,
                  persId: pers?._id ?? null,
									hasOpening: pers != null,
								};
						  });

				const items = openings.map((a) =>
					this.fbHelper.fbRef.group(a)
				);
				// const items = this.fbHelper.fbRef.array(assigments.map(a => this.fbHelper.fbRef.group(a)))

				items.forEach((item) => {
					this.form.controls.personalizations.push(item);
				});

				return openings;
			}),
			shareReplay(1)
		);
	}

  public applyOpenings() {
    const { personalizations, task } = this.form.value

    if (!personalizations) {
      console.warn('No personalizations');
      return;
    }

    if (!task) {
      console.warn('No task provided');
      return;
    }

    const openings = (personalizations as OpeningPersonalization[]).map(pers => ({
      uuid: generateUUID(),
      profile: pers.profile._id,
      persId: pers.persId,
      task,
      hasOpening: pers.hasOpening,
    }))

    const body = openings.reduce((acc, item) => {
      if (item.hasOpening) {
        acc.open.push(item)
      } else {
        acc.close.push(item)
      }
      return acc;
    }, { open: new Array<typeof openings[0]>(), close: new Array<typeof openings[0]>() })

    this.personalizationService.applyTasksOpening(body).subscribe({
      next: (res) => {
        this.refreshProfiles$.next()
        this.form.controls.personalizations.markAsPristine()
        this.isListChanged = false;
      },
      error: (err) => {
          console.error('Opening error', err);
          this.isListChanged = false;
      },
    })
  }
}
