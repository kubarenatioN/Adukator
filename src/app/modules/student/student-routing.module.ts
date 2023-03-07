import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseTrainingComponent } from './components/course-training/course-training.component';
import { StudentComponent } from './student.component';

const routes: Routes = [
    {
        path: 'training/:id',
        pathMatch: 'full',
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
