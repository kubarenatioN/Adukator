import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ValdemortModule } from 'ngx-valdemort';

@NgModule({
	declarations: [AuthComponent, LoginComponent, RegisterComponent],
	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
		SharedModule,
		ValdemortModule,
	],
})
export class AuthModule {}
