import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import { map, Observable, of, shareReplay, switchMap, withLatestFrom } from 'rxjs';
import { getCategory } from 'src/app/helpers/courses.helper';
import { getDurationInMilliseconds } from 'src/app/helpers/date-fns.helper';
import { ConfigService } from 'src/app/services/config.service';
import { CoursesService } from 'src/app/services/courses.service';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-course-overview',
	templateUrl: './course-overview.component.html',
	styleUrls: ['./course-overview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent {
    public course$: Observable<Course | null>;
    
	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService, private configService: ConfigService) {
        this.course$ = this.activatedRoute.paramMap.pipe(
            switchMap(paramMap => {
                const id = paramMap.get('id')
                if (id) {
                    return this.coursesService.getCourseById(Number(id));
                }
                return of(null);
            }),
            shareReplay(1),
        );
    }
}
