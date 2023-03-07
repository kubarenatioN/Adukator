import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { CoursesService } from 'src/app/services/courses.service';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-training',
	templateUrl: './course-training.component.html',
	styleUrls: ['./course-training.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseTrainingComponent implements OnInit {
    public course$!: Observable<Course | null>
    
	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {
        this.course$ = this.activatedRoute.paramMap.pipe(
            switchMap(params => {
                const courseId = Number(params.get('id'));
                if (isNaN(courseId)) {
                    return of(null)
                }
                return this.coursesService.getCourseById(courseId);
            })
        )
    }

	ngOnInit(): void {}
}
