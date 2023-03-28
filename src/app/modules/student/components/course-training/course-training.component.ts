import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
import { convertCourseToCourseTraining } from 'src/app/helpers/courses.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseTrainingService } from 'src/app/services/course-training.service';
import { CoursesService } from 'src/app/services/courses.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseModule, CourseTraining, ModuleTopic } from 'src/app/typings/course.types';

enum ViewType {
    Main = 'main',
    Module = 'module',
    Topic = 'topic',
}

interface ViewConfig {
    viewType: ViewType,
    course: CourseTraining,
    module?: CourseModule,
    topic?: ModuleTopic
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
    public viewData$!: Observable<ViewConfig>

    public topicUploadPath: string = '';

    public viewTypes = ViewType;
    
	constructor(
        private trainingService: CourseTrainingService,
        private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {
        super();
    }

	ngOnInit(): void {
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
            tap(course => {
                this.trainingService.course = course;
            }),
            shareReplay(1)
        )

        this.viewData$ = combineLatest([
            this.activatedRoute.queryParams,
            this.course$.pipe(filter(Boolean)),
        ])
        .pipe(
            takeUntil(this.componentLifecycle$),
            map(([params, course]) => {
                const { module: moduleIndex, topic: topicIndex } = params;
                const viewType = this.getViewType(moduleIndex, topicIndex)
                if (viewType === this.viewTypes.Module) {
                    return {
                        viewType,
                        course: course,
                        module: course?.modules[moduleIndex - 1],
                    }
                }
                if (viewType === this.viewTypes.Topic) {
                    const topic = course?.modules[moduleIndex - 1].topics[topicIndex - 1]
                    this.topicUploadPath = UploadHelper.getTopicUploadFolder('object', course, topic.id);
                    return {
                        viewType,
                        course: course,
                        module: course?.modules[moduleIndex - 1],
                        topic: topic,
                    }
                }

                return { viewType, course }
            })
        )
    }

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
