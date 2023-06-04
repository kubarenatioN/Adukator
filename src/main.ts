import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { apiUrl } from './app/constants/urls';
import { CourseCategory } from './app/services/config.service';
import { CourseCompetency } from './app/typings/course.types';

if (environment.production) {
	enableProdMode();
}

// const configFilesPath = `${apiUrl}/static/config`;

// const categories: Promise<CourseCategory> = fetch(`${configFilesPath}/course-categories.json`).then(res => res.json())
// const competencies: Promise<CourseCompetency> = fetch(`${configFilesPath}/course-competencies.json`).then(res => res.json())

// Promise.all([
// 	categories,
// 	competencies	
// ])
// 	.then(([categories, competencies]) => {
		
// 	})
// 	.catch(err => {
// 		console.error(err);
// 		initApp()
// 	})

// function initApp() {
// 	platformBrowserDynamic()
// 		.bootstrapModule(AppModule)
// 		.catch((err) => console.error(err));
// }

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
