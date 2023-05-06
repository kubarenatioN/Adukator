import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, finalize, map, Observable, shareReplay } from 'rxjs';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { TeacherTrainingService } from 'src/app/modules/teacher/services/teacher-training.service';
import { Course, CourseReview } from 'src/app/typings/course.types';
import { Training } from 'src/app/typings/training.types';
import { StartTrainingSubmitComponent } from './modals/start-training-submit/start-training-submit.component';

@Component({
	selector: 'app-teacher',
	templateUrl: './teacher.component.html',
	styleUrls: ['./teacher.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherComponent extends CenteredContainerDirective implements OnInit {
    private trainingsStore$ = new BehaviorSubject<Training[]>([])
    
    public trainings$: Observable<Training[]>
    public publishedCourses: Course[] = []
    public reviewCourses$: Observable<CourseReview[]>

	constructor(
        private teacherCourses: TeacherTrainingService, 
        private dialogService: MatDialog,
        private cdRef: ChangeDetectorRef,
    ) {
        super();

        this.teacherCourses.trainings$.subscribe(res => {
            this.trainingsStore$.next(res)
        })
        this.trainings$ = this.trainingsStore$.asObservable().pipe(
            map(res => res.filter(t => t.status === 'active')),
            shareReplay(1)
        )

        this.teacherCourses.published$.subscribe(res => {
            this.publishedCourses = res
        });
        this.reviewCourses$ = this.teacherCourses.review$.pipe(
            map(courses => courses.filter(c => c.masterId === null))
        );
    }

	ngOnInit(): void {

    }

    public startCourse(course: Course, e: Event) {
        const modal = this.dialogService.open(StartTrainingSubmitComponent, {
            data: { uuid: course.uuid }
        })
        const btn = (e.target as HTMLButtonElement)
        btn.disabled = true;

        modal.afterClosed().subscribe((res: Training | 'error') => {
            if (res === 'error') {
                btn.disabled = true;
                console.warn('Error starting training');
            }
            if (!res) {
                btn.disabled = false
            }
            if (res && typeof res === 'object') {
                this.publishedCourses = this.publishedCourses.map(c => {
                    if (c.uuid === res.courseId) {
                        c.training = res        
                    }
                    return c
                })
                this.teacherCourses.refreshTeacherTrainings()
                this.cdRef.detectChanges()
            }
        })
    }
}
