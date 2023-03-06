import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { CoursesService } from 'src/app/services/courses.service';
import { Course } from 'src/app/typings/course.types';
import { CourseMembers } from 'src/app/typings/response.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-course-management',
	templateUrl: './course-management.component.html',
	styleUrls: ['./course-management.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent implements OnInit {
    private courseStudents$: Observable<CourseMembers | null>

    public course$: Observable<Course | null>
    public pendingStudents$: Observable<User[]>; 
    public approvedStudents$: Observable<User[]>; 
    public rejectedStudents$: Observable<User[]>; 

	constructor(private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {
        this.course$ = combineLatest([
            this.activatedRoute.paramMap,
            this.coursesService.teacherUserCourses$,
        ]).pipe(
            map(([params, teacherCourses]) => {
                const id = params.get('id');
                if (id) {
                    const course = teacherCourses?.published?.find(course => course.id === Number(id))
                    console.log(course);
                    return course ? course : null
                }
                return null
            })
        )

        this.courseStudents$ = this.course$.pipe(
            switchMap(course => {
                if (course === null) {
                    return of(null);
                }
                return this.coursesService.getCourseMembers({
                    type: 'list',
                    status: ['Approved', 'Pending', 'Rejected'].join(','),
                    size: 10,
                    page: 0,
                    courseId: course.id,
                })       
            })
        )

        this.pendingStudents$ = this.getCourseMemberByStatus('pending')
        this.approvedStudents$ = this.getCourseMemberByStatus('approved')
        this.rejectedStudents$ = this.getCourseMemberByStatus('rejected')
    }

	public ngOnInit(): void {
        
    }

    private getCourseMemberByStatus(status: keyof CourseMembers) {
        return this.courseStudents$.pipe(
            map(students => students ? students[status] : [])
        )
    }
}
