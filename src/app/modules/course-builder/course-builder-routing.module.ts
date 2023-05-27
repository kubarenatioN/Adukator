import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuardService } from 'src/app/guards/admin-guard.service';
import { TeacherGuardService } from 'src/app/guards/teacher-guard.service';
import { CourseFormViewMode } from 'src/app/typings/course.types';
import { CreateCourseComponent } from './components/create-course/create-course.component';
import { ReviewCourseComponent } from './components/review-course/review-course.component';
import { CourseBuilderComponent } from './course-builder.component';

const routes: Routes = [
	{
		path: '',
		component: CourseBuilderComponent,
		children: [
			{
				path: 'create',
				canActivate: [TeacherGuardService],
				component: CreateCourseComponent,
				data: { mode: CourseFormViewMode.Create },
			},
			{
				path: ':id',
				children: [
					{
						path: 'edit',
						canActivate: [TeacherGuardService],
						component: CreateCourseComponent,
						data: { mode: CourseFormViewMode.Edit },
					},
					{
						path: 'update',
						canActivate: [TeacherGuardService],
						component: CreateCourseComponent,
						data: { mode: CourseFormViewMode.Update },
					},
					{
						path: 'review',
						canActivate: [AdminGuardService],
						component: ReviewCourseComponent,
					},
				],
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'create'
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CourseBuilderRoutingModule {}
