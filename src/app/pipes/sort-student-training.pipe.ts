import { Pipe, PipeTransform } from '@angular/core';
import { Training, TrainingProfile, TrainingProfileTraining } from '../typings/training.types';

@Pipe({
  name: 'sortStudentTraining'
})
export class SortStudentTrainingPipe implements PipeTransform {

  transform(profiles: TrainingProfileTraining[]): TrainingProfileTraining[] {
    return profiles.sort(p => p.training.status === 'active' ? -1 : 1);
  }

}
