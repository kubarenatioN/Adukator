import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseTrainingGuardService } from 'src/app/guards/course-training-guard.service';
import { CourseTrainingComponent } from './components/course-training/course-training.component';

const routes: Routes = [
    {
        path: 'training/:id',
        pathMatch: 'full',
        canActivate: [
            CourseTrainingGuardService
        ],
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
