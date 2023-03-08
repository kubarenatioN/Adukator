import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap, takeUntil } from 'rxjs';
import { convertCourseFormDataToCourse, convertCourseToCourseTraining } from 'src/app/helpers/courses.helper';
import { CoursesService } from 'src/app/services/courses.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { Course, CourseTopic, CourseTraining } from 'src/app/typings/course.types';

enum ViewType {
    Main = 'main',
    Module = 'module',
    Topic = 'topic',
}

@Component({
	selector: 'app-course-training',
	templateUrl: './course-training.component.html',
	styleUrls: ['./course-training.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseTrainingComponent extends BaseComponent implements OnInit {
    private viewTypeStore$ = new BehaviorSubject<ViewType>(ViewType.Main)

    public viewType$: Observable<string> = this.viewTypeStore$.asObservable();
    public course$!: Observable<CourseTraining | null>
    public topic$!: Observable<CourseTopic | null>


    public viewTypes = ViewType;
    
	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {
        super();
        this.course$ = this.activatedRoute.paramMap.pipe(
            switchMap(params => {
                const courseId = Number(params.get('id'));
                if (isNaN(courseId)) {
                    return of(null)
                }
                return this.coursesService.getCourseById(courseId);
            }),
            map(course => {
                if (course) {
                    return convertCourseToCourseTraining(course)
                }
                return null;
            }),
            shareReplay(1)
        )

        this.activatedRoute.queryParams
        .pipe(
            takeUntil(this.componentLifecycle$)
        )
        .subscribe(res => {
            const { module, topic } = res;
            const viewType = this.getViewType(module, topic)
            if (viewType === this.viewTypes.Topic) {
                this.topic$ = this.course$.pipe(
                    map(course => course ? course.modules[module - 1].topics[topic - 1] : null)
                )
            }
            this.viewTypeStore$.next(viewType)
        })
    }

	ngOnInit(): void {}

    private getViewType(moduleIndex: number, topicIndex: number): ViewType {
        if (!moduleIndex && !topicIndex) {
            return ViewType.Main
        }
        if (moduleIndex && !topicIndex) {
            return ViewType.Module
        }
        if (moduleIndex && topicIndex) {
            return ViewType.Topic
        }
        return ViewType.Main
    }
}
