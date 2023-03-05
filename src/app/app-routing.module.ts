import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { AdminGuardService } from './guards/admin-guard.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { AppGuardService } from './guards/app-guard.service';

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
				path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard',
				// loadChildren: () =>
				// 	import('./modules/dashboard/dashboard.module').then(
				// 		(m) => m.DashboardModule
				// 	),
			},
			{
				path: 'dashboard',
				loadChildren: () =>
					import('./modules/dashboard/dashboard.module').then(
						(m) => m.DashboardModule
					),
			},
			{
				path: 'learn',
				loadChildren: () =>
					import('./modules/learn/learn.module').then(
						(m) => m.LearnModule
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
				path: 'profile/:id',
				loadChildren: () =>
					import('./modules/user-profile/user-profile.module').then(
						(m) => m.UserProfileModule
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
