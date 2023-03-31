import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
import { convertCourseToCourseTraining } from 'src/app/helpers/courses.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { CourseTraining } from 'src/app/models/course.model';
import { CourseTrainingService } from 'src/app/services/course-training.service';
import { CoursesService } from 'src/app/services/courses.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { CourseModule, ICourseTraining, ModuleTopic } from 'src/app/typings/course.types';
import { isActualTopic } from '../../helpers/course-training.helper';

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
    public viewData$!: Observable<ViewConfig>

    public topicUploadPath: string = '';

    public viewTypes = ViewType;
    
	constructor(
        private trainingService: CourseTrainingService,
        private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {
        super();
    }

	ngOnInit(): void {
        const course$ = this.activatedRoute.paramMap.pipe(
            switchMap(params => {
                const courseId = Number(params.get('id'));
                if (isNaN(courseId)) {
                    return of(null)
                }
                return this.coursesService.getCourseById(courseId);
            }),
            map(course => {
                if (course) {
                    const courseTraining = convertCourseToCourseTraining(course)
                    return new CourseTraining(courseTraining);
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
            course$.pipe(filter(Boolean)),
        ])
        .pipe(
            takeUntil(this.componentLifecycle$),
            map(([params, course]: [{module?: string, topic?: string}, CourseTraining]) => {
                const { module: moduleId, topic: topicId } = params;
                const viewType = this.getViewType(moduleId, topicId)
                if (viewType === this.viewTypes.Module && moduleId) {
                    return {
                        viewType,
                        course: course,
                        module: course.getModule(moduleId),
                    }
                }
                if (viewType === this.viewTypes.Topic && topicId) {
                    const topic = course.getTopic(topicId);
                    this.topicUploadPath = UploadHelper.getTopicUploadFolder('course', course, topicId);
                    return {
                        viewType,
                        course: course,
                        module: course.getTopicModule(topicId),
                        topic: topic,
                    }
                }

                return { viewType, course }
            })
        )
    }

    private getViewType(moduleId?: string, topicId?: string): ViewType {
        if (!moduleId && !topicId) {
            return ViewType.Main
        }
        if (moduleId && !topicId) {
            return ViewType.Module
        }
        if (moduleId && topicId) {
            return ViewType.Topic
        }
        return ViewType.Main
    }
}
