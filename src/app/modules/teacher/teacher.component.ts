import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
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

	constructor(private teacherCourses: TeacherCoursesService) {
        super();

        this.publishedCourses$ = this.teacherCourses.published$;
        this.trainings$ = this.teacherCourses.trainings$;
        this.reviewCourses$ = this.teacherCourses.review$.pipe(
            map(courses => courses.filter(c => c.masterId === null))
        );
    }

	ngOnInit(): void {
        // this.teacherCourses.getCourses()
    }
}
