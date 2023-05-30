import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map, Observable, shareReplay, tap, withLatestFrom } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { generateUUID } from 'src/app/helpers/courses.helper';
import { StudentTraining } from 'src/app/models/course.model';
import { UploadService } from 'src/app/services/upload.service';
import { ModuleTopic, TopicTask } from 'src/app/typings/course.types';
import { PersonalTask, Training } from 'src/app/typings/training.types';
import { PersonalizationService } from '../../services/personalization.service';
import { TeacherTrainingService } from '../../services/teacher-training.service';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';

@Component({
	selector: 'app-personal-tasks',
	templateUrl: './personal-tasks.component.html',
	styleUrls: ['./personal-tasks.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalTasksComponent 
	extends CenteredContainerDirective
	implements OnInit 
{
	private activeTraining?: Training;

	public trainings$: Observable<Training[]>;
	public topics$!: Observable<ModuleTopic[] | null>;
	public tasks$!: Observable<PersonalTask[]>;

	public form;
	public shouldShowTaskForm = false;

	public uploadFolder: string = '';

	constructor(
		private fb: FormBuilder,
		private uploadService: UploadService,
		private teacherService: TeacherTrainingService,
		private personalizationService: PersonalizationService
	) {
		super();
		this.form = this.fb.group({
			uuid: generateUUID(),
			training: ['', Validators.required],
			topic: ['', Validators.required],
			taskDescr: ['', Validators.required],
			materials: [[] as string[]],
		});

		this.trainings$ = this.teacherService
			.getTeacherTrainings(CoursesSelectFields.Modules)
			.pipe(shareReplay(1));
	}

	ngOnInit(): void {
		this.tasks$ = this.personalizationService.getTeacherTasks();

		this.topics$ = this.form.controls.training.valueChanges.pipe(
			withLatestFrom(this.trainings$),
			map(([trainingId, trainings]) => {
				const training: Training | undefined = trainings.find(
					(training) => training.uuid === trainingId
				);
				this.activeTraining = training;
				const courseTraining: StudentTraining | null = training
					? new StudentTraining(training)
					: null;
				return courseTraining ? courseTraining.topics : null;
			}),
			tap((topics) => {
				if (topics && topics.length > 0) {
					this.form.patchValue({
						topic: topics[0].id,
					});
				}
				const { training, uuid } = this.form.value;
				this.uploadFolder = this.uploadService.getFilesFolder(
					'personalization',
					training ?? '',
					uuid ?? ''
				);
			})
		);

		this.form.controls.topic.valueChanges.subscribe((topicId) => {
			this.form.patchValue({
				taskDescr: '',
				materials: [],
			});
		});

		this.form.valueChanges.subscribe((model) => {
			this.shouldShowTaskForm =
				model.training != null && model.topic != null;
		});
	}

	public onUploadFilesChanged(files: string[]) {
		this.form.patchValue({
			materials: files,
		});
	}

	public createTask() {
		const { materials, taskDescr, uuid, topic } = this.form.value;
		if (!materials || materials.length === 0) {
			console.warn('No files attached to task.');
			return;
		}
		if (!taskDescr) {
			console.warn('No task description was provided.');
			return;
		}

		if (!uuid || !topic || !this.activeTraining) {
			console.warn('Not enough data to create task.');
			return;
		}

		const task: TopicTask = {
			id: uuid,
			taskDescr,
			materials,
		};

		this.personalizationService
			.createTask(this.activeTraining, topic, task)
			.subscribe((res) => {
				console.log(res);
			});
	}

	public getTopic(task: PersonalTask) {
		return task.training.course.topics.find(t => t.id === task.topicId)
	}
}
