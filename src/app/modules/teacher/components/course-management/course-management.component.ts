import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs/operators';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { TrainingManagementService } from 'src/app/modules/teacher/services/course-management.service';
import { TeacherCoursesService } from 'src/app/modules/teacher/services/teacher-courses.service';
import { Course } from 'src/app/typings/course.types';
import { Training, TrainingMembershipMap, TrainingMembershipSearchParams, TrainingMembershipStatus as EnrollStatus, TrainingProfile } from 'src/app/typings/training.types';
import { User } from 'src/app/typings/user.types';

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
    
    public get approvedStudents$(): Observable<TrainingProfile[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.approved),
            shareReplay(1),
        )
    }
    
    public get pendingStudents$(): Observable<TrainingProfile[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.pending),
            shareReplay(1),
        )
    }
    
    public get rejectedStudents$(): Observable<TrainingProfile[]> {
        return this.courseMembershipStore$.pipe(
            distinctUntilChanged(),
            map(store => store.rejected),
            shareReplay(1),
        )
    }

	constructor(
        private activatedRoute: ActivatedRoute, 
        private trainingManagement: TrainingManagementService,
        private teacherCourses: TeacherCoursesService
    ) {
        super();
    }

	public ngOnInit(): void {
        this.training$ = combineLatest([
            this.activatedRoute.paramMap,
            this.teacherCourses.trainings$,
        ]).pipe(
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
        const options: TrainingMembershipSearchParams = {
            type: 'list',
            trainingId,
            size: 10,
            page: 0,
            populate: ['student', 'training']
        }
        combineLatest([
            this.trainingManagement.getProfiles({
                ...options,
                status: EnrollStatus.Pending,
            }),
            this.trainingManagement.getProfiles({
                ...options,
                status: EnrollStatus.Approved,
            }),
        ])
        .subscribe(([pending, approved]) => {
            const store = this.courseMembershipStore$.value;
            this.courseMembershipStore$.next({
                pending: pending,
                approved: approved,
                rejected: store.rejected,
            });
        })
    }

    public onApproveEnroll(profile: TrainingProfile) {
        this.trainingManagement.updateStudentTrainingEnrollment(
            [profile.student._id], 
            profile.training._id,
            EnrollStatus.Approved
        ).subscribe()
    }

    public onExpel(profile: TrainingProfile) {
        this.trainingManagement.updateStudentTrainingEnrollment(
            [profile.student._id], 
            profile.training._id,
            EnrollStatus.Rejected
        ).subscribe()
    }
}
