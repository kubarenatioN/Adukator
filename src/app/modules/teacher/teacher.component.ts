import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { TeacherTrainingService } from 'src/app/modules/teacher/services/teacher-training.service';
import { CoursesService } from 'src/app/services/courses.service';
import { Course, CourseReview } from 'src/app/typings/course.types';
import { Training } from 'src/app/typings/training.types';

@Component({
	selector: 'app-teacher',
	templateUrl: './teacher.component.html',
	styleUrls: ['./teacher.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherComponent extends CenteredContainerDirective implements OnInit {
    public trainings$: Observable<Training[]>
    public publishedCourses$: Observable<Course[]>
    public reviewCourses$: Observable<CourseReview[]>

	constructor(private teacherCourses: TeacherTrainingService, private coursesService: CoursesService) {
        super();

        this.trainings$ = this.teacherCourses.trainings$;

        // TODO: Move these streams from 'courses-service' to smth like 'user-courses-service'
        this.publishedCourses$ = this.coursesService.published$;
        this.reviewCourses$ = this.coursesService.review$.pipe(
            map(courses => courses.filter(c => c.masterId === null))
        );
    }

	ngOnInit(): void {
        // this.teacherCourses.getCourses()
    }
}
