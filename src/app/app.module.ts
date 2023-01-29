import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavComponent } from './components/nav/nav.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './components/main/main.component';

@NgModule({
	declarations: [AppComponent, NavComponent, MainComponent],
	imports: [BrowserModule, AppRoutingModule, NoopAnimationsModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
