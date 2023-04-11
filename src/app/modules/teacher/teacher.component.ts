import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { Course, CourseReview, CourseTraining, CourseTrainingMeta, TeacherCourses } from 'src/app/typings/course.types';

@Component({
	selector: 'app-teacher',
	templateUrl: './teacher.component.html',
	styleUrls: ['./teacher.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherComponent extends CenteredContainerDirective implements OnInit {
    public trainings$: Observable<CourseTrainingMeta[]>
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
