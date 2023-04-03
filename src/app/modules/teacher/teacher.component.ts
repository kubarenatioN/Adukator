import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { CoursesService } from 'src/app/services/courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { Course, CourseReview, TeacherCourses } from 'src/app/typings/course.types';

@Component({
	selector: 'app-teacher',
	templateUrl: './teacher.component.html',
	styleUrls: ['./teacher.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherComponent extends CenteredContainerDirective implements OnInit {
    private teacherCourses$: Observable<TeacherCourses | null>

    public publishedCourses$: Observable<Course[] | null>
    public reviewCourses$: Observable<CourseReview[] | null>

	constructor(private teacherCourses: TeacherCoursesService) {
        super();
        this.teacherCourses$ = this.teacherCourses.courses$;
        
        this.publishedCourses$ = this.teacherCourses$.pipe(
            map(courses => courses?.published ?? [])
        )
        this.reviewCourses$ = this.teacherCourses$.pipe(
            map(courses => courses?.review?.filter(course => !course.masterId) ?? [])
        )
    }

	ngOnInit(): void {}
}
