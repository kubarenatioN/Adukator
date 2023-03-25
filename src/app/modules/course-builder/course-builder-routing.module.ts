import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuardService } from 'src/app/guards/admin-guard.service';
import { TeacherGuardService } from 'src/app/guards/teacher-guard.service';
import { CourseFormViewMode } from 'src/app/typings/course.types';
import { CreateCourseComponent } from './components/create-course/create-course.component';

const routes: Routes = [
    {
        path: 'create',
        canActivate: [
            TeacherGuardService,
        ],
        component: CreateCourseComponent,
        data: { mode: CourseFormViewMode.Create },
    },
    {
        path: ':id',
        children: [
            {
                path: 'edit',
                canActivate: [
                    TeacherGuardService,
                ],
                component: CreateCourseComponent,
                data: { mode: CourseFormViewMode.Edit },
            },
            {
                path: 'update',
                canActivate: [
                    TeacherGuardService,
                ],
                component: CreateCourseComponent,
                data: { mode: CourseFormViewMode.Update },
            },
            {
                path: 'review',
                canActivate: [
                    AdminGuardService
                ],
                component: CreateCourseComponent,
                data: { mode: CourseFormViewMode.Review },
            },
        ]
    }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CourseBuilderRoutingModule {}
