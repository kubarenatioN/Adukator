import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { TrainingManagementService } from 'src/app/modules/teacher/services/course-management.service';
import { TeacherTrainingService } from 'src/app/modules/teacher/services/teacher-training.service';
import { Training, TrainingMembershipStatus as EnrollStatus, TrainingProfile } from 'src/app/typings/training.types';
import { User } from 'src/app/typings/user.types';

interface TrainingMembershipMap {
    pending: TrainingProfile<string, User>[];
    approved: TrainingProfile<string, User>[];
    rejected: TrainingProfile<string, User>[];
}

@Component({
	selector: 'app-course-management',
	templateUrl: './course-management.component.html',
	styleUrls: ['./course-management.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent extends CenteredContainerDirective implements OnInit {
    private courseMembershipStore$ = new BehaviorSubject<TrainingMembershipMap>({
        pending: [],
        approved: [],
        rejected: [],
    })

    public training$!: Observable<Training | null>
    
    public get approvedStudents$(): Observable<TrainingProfile<string, User>[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.approved),
            shareReplay(1),
        )
    }
    
    public get pendingStudents$(): Observable<TrainingProfile<string, User>[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.pending),
            shareReplay(1),
        )
    }
    
    public get rejectedStudents$(): Observable<TrainingProfile<string, User>[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.rejected),
            shareReplay(1),
        )
    }

	constructor(
        private activatedRoute: ActivatedRoute, 
        private trainingManagement: TrainingManagementService,
        private teacherTrainingService: TeacherTrainingService
    ) {
        super();
    }

	public ngOnInit(): void {
        this.training$ = combineLatest([
            this.activatedRoute.paramMap,
            this.teacherTrainingService.trainings$,
        ]).pipe(
            takeUntil(this.componentLifecycle$),
            map(([params, trainings]) => {
                const id = String(params.get('id'));
                console.log(id, trainings);
                if (id) {
                    const training = trainings.find(training => training.uuid === id)
                    return training ?? null
                }
                return null
            }),
            tap(training => {
                if (training) {
                    this.getInitialMembers(training._id);
                }
            }),
            shareReplay(1),
        )
    }

    public getInitialMembers(trainingId: string) {
        combineLatest([
            this.teacherTrainingService.getEnrollmentList(
                trainingId,
                EnrollStatus.Pending,
                { page: 0 }
            ),
            this.teacherTrainingService.getEnrollmentList(
                trainingId,
                EnrollStatus.Approved,
                { page: 0 }
            ),
        ])
        .pipe(
            takeUntil(this.componentLifecycle$),
        )
        .subscribe(([pending, approved]) => {
            const store = this.courseMembershipStore$.value;
            this.courseMembershipStore$.next({
                pending: pending,
                approved: approved,
                rejected: store.rejected,
            });
        })
    }

    public onApproveEnroll(profile: TrainingProfile<string, User>) {
        console.log(profile);
        this.trainingManagement.updateStudentTrainingEnrollment(
            [profile.student._id], 
            profile.training,
            EnrollStatus.Approved
        ).subscribe()
    }

    public onExpel(profile: TrainingProfile<string, User>) {
        this.trainingManagement.updateStudentTrainingEnrollment(
            [profile.student._id], 
            profile.training,
            EnrollStatus.Rejected
        ).subscribe()
    }
}
