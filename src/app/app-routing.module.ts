import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { AdminGuardService } from './guards/admin-guard.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { AppGuardService } from './guards/app-guard.service';
import { TeacherGuardService } from './guards/teacher-guard.service';
import { CourseReviewGuardService } from './guards/course-review-guard.service';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'app',
	},
	{
		path: 'app',
		component: MainComponent,
		canActivate: [AppGuardService],
		children: [
			{
				path: 'learn',
				loadChildren: () =>
					import('./modules/learn/learn.module').then(
						(m) => m.LearnModule
					),
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'dashboard',
			},
			{
				path: 'dashboard',
				loadChildren: () =>
					import('./modules/dashboard/dashboard.module').then(
						(m) => m.DashboardModule
					),
			},
			{
				path: 'admin',
				canActivate: [AdminGuardService],
				loadChildren: () =>
					import('./modules/admin/admin.module').then(
						(m) => m.AdminModule
					),
			},
			{
				path: 'student',
				loadChildren: () =>
					import('./modules/student/student.module').then(
						(m) => m.StudentModule
					),
			},
			{
				path: 'teacher',
				canActivate: [TeacherGuardService],
				loadChildren: () =>
					import('./modules/teacher/teacher.module').then(
						(m) => m.TeacherModule
					),
			},
			{
				path: 'user',
				loadChildren: () =>
					import('./modules/user-profile/user-profile.module').then(
						(m) => m.UserProfileModule
					),
			},
			{
				path: 'course-builder',
				loadChildren: () =>
					import(
						'./modules/course-builder/course-builder.module'
					).then((m) => m.CourseBuilderModule),
			},
			{
				path: 'course-review',
				loadChildren: () =>
					import('./modules/course-review/course-review.module').then(
						(m) => m.CourseReviewModule
					),
			},
		],
	},
	{
		path: 'auth',
		canActivate: [AuthGuardService],
		loadChildren: () =>
			import('./modules/auth/auth.module').then((m) => m.AuthModule),
	},
	{
		path: '**',
		redirectTo: 'app',
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
