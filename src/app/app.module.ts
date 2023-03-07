import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavComponent } from './components/nav/nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './components/main/main.component';
import { SharedModule } from './modules/shared/shared.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token-interceptor.service';
import { BackBtnComponent } from './components/back-btn/back-btn.component';
import { DatePipe } from './pipes/date.pipe';
import { TimeDurationPipe } from './pipes/time-duration.pipe';
import { ResponseTransformationInterceptor } from './interceptors/response-transformation-interceptor.service';
import { CenteredContainerDirective } from './directives/centered-container.directive';

@NgModule({
	declarations: [AppComponent, NavComponent, MainComponent, CenteredContainerDirective],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule,
		SharedModule,
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
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
