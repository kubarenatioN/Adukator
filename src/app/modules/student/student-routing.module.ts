import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UserService } from 'src/app/services/user.service';
import { TrainingProfileUser } from 'src/app/typings/training.types';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';

const profileResolver: ResolveFn<{ hasAccess: boolean, profile?: TrainingProfileUser }> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userService = inject(UserService)
    const trainingDataService = inject(TrainingDataService)
    const trainingId = route.paramMap.get('id') ?? ''
    return userService.user$.pipe(
        switchMap(user => trainingDataService.checkTrainingAccess({ trainingUUId: trainingId, userId: user._id }))
    )
} 

const routes: Routes = [
    {
        path: 'profile/:id/training',
        component: CourseTrainingComponent
    },
    {
        path: 'profile/:id',
        component: StudentProfileComponent,
    },
    {
        path: 'profile',
        component: StudentProfileComponent
    },
    {
        path: '**',
        redirectTo: '/app/learn/catalog',
    }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class StudentRoutingModule {}
