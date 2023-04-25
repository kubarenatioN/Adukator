import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { map, Observable, shareReplay, tap, withLatestFrom } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { generateUUID } from 'src/app/helpers/courses.helper';
import { StudentTraining } from 'src/app/models/course.model';
import { UploadService } from 'src/app/services/upload.service';
import { ModuleTopic, TopicTask } from 'src/app/typings/course.types';
import { Training } from 'src/app/typings/training.types';
import { PersonalizationService } from '../../services/personalization.service';
import { TeacherTrainingService } from '../../services/teacher-training.service';

@Component({
	selector: 'app-personal-tasks',
	templateUrl: './personal-tasks.component.html',
	styleUrls: ['./personal-tasks.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalTasksComponent implements OnInit {
    private activeTraining?: Training
    
	public trainings$: Observable<Training[]>
    public topics$!: Observable<ModuleTopic[] | null>
    public tasks$ = this.personalizationService.personalTasks$;
    
	public form;
    public shouldShowTaskForm = false;

    public uploadFolder: string = ''
    
	constructor(private fb: FormBuilder, 
        private uploadService: UploadService,
        private teacherService: TeacherTrainingService, 
        private personalizationService: PersonalizationService
    ) {
		this.form = this.fb.group({
            uuid: generateUUID(),
			training: '',
			topic: '',
			taskDescr: '',
			materials: [[] as string[]],
		});

        this.trainings$ = this.personalizationService.getTrainings(CoursesSelectFields.Modules).pipe(shareReplay(1))
	}

	ngOnInit(): void {
        this.topics$ = this.form.controls.training.valueChanges.pipe(
            withLatestFrom(this.trainings$),
            map(([trainingId, trainings])=> {
                const training: Training | undefined = trainings.find(training => training.uuid === trainingId)
                this.activeTraining = training
                const courseTraining: StudentTraining | null = training ? new StudentTraining(training) : null
                return courseTraining ? courseTraining.topics : null
            }),
            tap(topics => {
                if (topics && topics.length > 0) {
                    this.form.patchValue({
                        topic: topics[0].id
                    })  
                }
                const { training, uuid } = this.form.value
                this.uploadFolder = this.uploadService.getFilesFolder('personalization', training ?? '', uuid ?? '')    
            })
        )

        this.form.controls.topic.valueChanges.subscribe(topicId => {
            this.form.patchValue({
                taskDescr: '',
                materials: []
            })
        })

        this.form.valueChanges.subscribe(model => {
            this.shouldShowTaskForm = model.training != null && model.topic != null
        })
    }

    public onUploadFilesChanged(files: string[]) {
        this.form.patchValue({
            materials: files
        })
    }

    public createTask() {
        const { materials, taskDescr, uuid, topic } = this.form.value
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
            return 
        }

        const task: TopicTask = {
            id: uuid,
            taskDescr,
            materials,
        }

        this.personalizationService.createTask(this.activeTraining, topic, task).subscribe(res => {
            console.log(res);
        })
    }
}
