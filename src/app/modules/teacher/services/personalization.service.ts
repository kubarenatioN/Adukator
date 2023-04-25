import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';
import { TopicTask } from 'src/app/typings/course.types';
import { PersonalizationAssignment, PersonalTask, Training } from 'src/app/typings/training.types';
import { PersonalizationProfile } from '../components/personalization/assign-task/assign-task.component';
import { TeacherTrainingService } from './teacher-training.service';

@Injectable({
	providedIn: 'root',
})
export class PersonalizationService {
    public personalTasks$: Observable<PersonalTask[]>
	
    constructor(private userService: UserService, private teacherService: TeacherTrainingService, private trainingDataService: TrainingDataService, private uploadService: UploadService) {
        this.personalTasks$ = this.getTasks()
    }

    public applyTasksAssignment(payload: { assign: PersonalizationAssignment[], unassign: PersonalizationAssignment[] }) {
        return this.trainingDataService.assignPersonalTasks(payload)
    }

    public getTrainings(fields: string[]) {
        return this.teacherService.getTeacherTrainings(fields)
    }

    public createTask(training: Training, topicId: string, task: TopicTask) {
        const upload$ = this.uploadService.moveFilesToRemote({
            fromFolder: `personalization/${training.uuid}/${task.id}`,
            toFolder: `personalization/${training.uuid}/${task.id}`,
            subject: 'personalization:task',
        }).pipe(shareReplay(1))

        return upload$.pipe(
            switchMap(() => this.userService.user$),
            switchMap(user => {
                return this.trainingDataService.createTask(training._id, topicId, user._id, task)
            })
        )
    }

    private getTasks() {
        return this.userService.user$.pipe(
            switchMap(user => {
                return this.trainingDataService.getPersonalTasks({
                    authorId: user._id
                })
            }),
            map(res => {
                return res.tasks  
            })
        )
    }
}
