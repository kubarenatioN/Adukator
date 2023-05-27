import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavComponent } from './components/nav/nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './components/main/main.component';
import { SharedModule } from './modules/shared/shared.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token-interceptor.service';
import { ResponseTransformationInterceptor } from './interceptors/response-transformation-interceptor.service';
import { CenteredContainerDirective } from './directives/centered-container.directive';
import { NgChartsModule } from 'ng2-charts';
import { apiUrl } from './constants/urls';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ValdemortModule } from 'ngx-valdemort';

export const COURSE_BANNER_EMPTY = new InjectionToken<string>('course banner empty img placeholder');

@NgModule({
	declarations: [
		AppComponent,
		NavComponent,
		MainComponent,
		CenteredContainerDirective,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule,
		SharedModule,
		NgChartsModule,
		ValdemortModule,
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: ResponseTransformationInterceptor,
			multi: true,
		},
		{
			provide: COURSE_BANNER_EMPTY,
			useValue: `${apiUrl}/static/images/course-banner-empty.jpg`
		},
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, 
			useValue: {appearance: 'outline'}
		}
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
