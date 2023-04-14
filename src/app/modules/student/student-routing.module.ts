import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UserService } from 'src/app/services/user.service';
import { TrainingProfile } from 'src/app/typings/training.types';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { CourseTrainingGuardService } from './guards/course-training-guard.service';

const profileResolver: ResolveFn<{ hasAccess: boolean, profile?: TrainingProfile }> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userService = inject(UserService)
    const trainingDataService = inject(TrainingDataService)
    const trainingId = route.paramMap.get('id') ?? ''
    return userService.user$.pipe(
        switchMap(user => trainingDataService.checkTrainingAccess({ trainingUUId: trainingId, userId: user._id }))
    )
} 

const routes: Routes = [
    {
        path: 'training/:id',
        pathMatch: 'full',
    // canActivate: [
    //     CourseTrainingGuardService
    // ],
        resolve: {
            trainingAccess: profileResolver
        },
        component: CourseTrainingComponent,
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
