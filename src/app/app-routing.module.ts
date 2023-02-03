import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'app',
	},
	{
		path: 'app',
		component: MainComponent,
		children: [
			{
				path: 'profile/:id',
				loadChildren: () =>
					import('./modules/user-profile/user-profile.module').then(
						(m) => m.UserProfileModule
					),
			},
			{
				path: 'learn',
				loadChildren: () =>
					import('./modules/learn/learn.module').then(
						(m) => m.LearnModule
					),
			},
		],
	},
	{
		path: 'auth',
		loadChildren: () =>
			import('./modules/auth/auth.module').then((m) => m.AuthModule),
	},
	{ path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
