import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPageComponent } from './components/user-page/user-page.component';
import { UserProfileComponent } from './user-profile.component';

const routes: Routes = [
	{
		path: 'wall/:id',
		component: UserPageComponent,
	},
	{
		path: ':id',
		component: UserProfileComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class UserProfileRoutingModule {}
