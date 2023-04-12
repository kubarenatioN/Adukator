import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { CoursesSelectFields } from '../config/course-select-fields.config';
import { NetworkRequestKey } from '../helpers/network.helper';
import { Course, CourseReview } from '../typings/course.types';
import { Training } from '../typings/training.types';
import { CoursesService } from './courses.service';
import { UserService } from './user.service';

const RequestKey = NetworkRequestKey.GetCourses

@Injectable({
	providedIn: 'root',
})
export class TeacherCoursesService {
    private initialStore = {
        trainings: [] as Training[],
        published: [] as Course[],
        review: [] as CourseReview[],
    };

    private coursesStore$ = new BehaviorSubject(this.initialStore);

    public trainings$ = this.selectObservableFromStore<typeof this.initialStore.trainings>('trainings');
    public published$ = this.selectObservableFromStore<typeof this.initialStore.published>('published');
    public review$ = this.selectObservableFromStore<typeof this.initialStore.review>('review');
    
	constructor(
        private userService: UserService, 
        private coursesService: CoursesService
    ) {
        this.getCourses()
    }

    public getCourseReviewVersion(courseId: string) {
        return this.coursesService.getCourseReviewVersion(courseId);   
    }

    public getCourses() {
        this.userService.user$.pipe(
            switchMap(user => {
                const options = {
                    requestKey: RequestKey,
                    authorId: user.uuid,
                    fields: CoursesSelectFields.Short,
                }
                return forkJoin({
                    trainings: this.coursesService.getCourses<{ data: Training[] }>({
                        ...options,
                        reqId: 'SelectTeacherTrainingCourses',
                        type: 'training',
                    }),
                    published: this.coursesService.getCourses<{ data: Course[] }>({
                        ...options,
                        reqId: 'SelectTeacherPublishedCourses',
                        type: 'published',
                    }),
                    review: this.coursesService.getCourses<{ data: CourseReview[] }>({
                        ...options,
                        reqId: 'SelectTeacherReviewCourses',
                        type: 'review',
                    }),
                })
            }),
        ).subscribe(response => {
            const { published, trainings, review } = response
            this.coursesStore$.next({
                published: published.data,
                trainings: trainings.data,
                review: review.data,
            });
        })
    }

    private selectObservableFromStore<T>(key: keyof typeof this.initialStore): Observable<T> {
        return this.coursesStore$.pipe(
            map(store => store[key] as unknown as T),
            shareReplay(1),
        );
    }
}
