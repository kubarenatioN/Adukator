import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { BundleComponent } from './bundle.component';
import { BundleItemComponent } from './bundle-item/bundle-item.component';

const routes: Routes = [
	{
		path: 'create',
		component: CreateComponent,
	},
	{
		path: '',
		component: BundleComponent,
		pathMatch: 'full',
	},
	{
		path: ':id',
		component: BundleItemComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class BundleRoutingModule {}
