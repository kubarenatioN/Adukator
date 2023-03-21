import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseReviewRoutingModule } from './course-review-routing.module';
import { CourseReviewComponent } from './course-review.component';
import { CourseReviewDiffComponent } from './components/course-review-diff/course-review-diff.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [CourseReviewComponent, CourseReviewDiffComponent],
	imports: [CommonModule, CourseReviewRoutingModule, SharedModule],
})
export class CourseReviewModule {}
