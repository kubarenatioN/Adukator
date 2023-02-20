import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { convertCourseToCourseFormData, stringifyModules } from 'src/app/helpers/courses.helper';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { CoursesService } from 'src/app/services/courses.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { CourseFormData } from 'src/app/typings/course.types';
import { testFormData } from '../course-form/course-form.component';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
	private courseData?: CourseFormData;

    public formData$!: Observable<CourseFormData | null>;
    public showLoading$ = new BehaviorSubject<boolean>(false);

	constructor(private dataService: DataService, private userService: UserService, private router: Router, private activatedRoute: ActivatedRoute, private coursesService: CoursesService) {}
    
    public ngOnInit(): void {
        this.activatedRoute.queryParams.pipe(
            take(1),
            switchMap(params => {
                const courseId = Number(params['id'])
                if (courseId) {
                    this.showLoading$.next(true)
                    return this.coursesService.getUserCourse(courseId, 'reviewChildren')
                }
                return of(null)
            }),
            map(course => {
                this.showLoading$.next(false)
                return course !== null 
                    ? convertCourseToCourseFormData(course)
                    : null
            })
        ).subscribe(course => {
            this.formData$ = of(course)
        })
    }

    public onPulish(courseData: CourseFormData): void {
        console.log('111 on change form Data', courseData);
        this.userService.user$.pipe(
            switchMap(user => {
                if (user && user.role === 'teacher') {
                    const course = {
                        ...courseData,
                        modules: stringifyModules(courseData.modules),
                        authorId: user.id
                    };
                    const payload = NetworkHelper.createRequestPayload(
                        NetworkRequestKey.CreateCourse,
                        {
                            body: { course },
                        }
                    );
                    this.showLoading()
                    return this.dataService.send(payload)
                }
                else {
                    return throwError(() => new Error('User has no permission to create a course.'))
                }
            }),
        ).subscribe({
            next: (res) => {
                console.log('111 create course response', res);
            },
            error: (err) => console.error(err)
        });	
    }

    public onSaveDraft(courseDraft: CourseFormData): void {
        console.log('111 on save draft', courseDraft);
    }

    public publishCourse() {
        // const processedCourseData = this.processCourseFormData(data);
		
    }

    public onSubmit(action: 'draft' | 'publish'): void {
		// const { valid: isValid, value, errors } = this.courseForm;
		// if (isValid) {
		// 	if (action === 'publish') {
		// 		this.publishCourse(value);
		// 	}
		// 	console.log(action, value);
		// } else {
		// 	console.log(action, errors);
		// }
	}

    private showLoading() {
        this.showLoading$.next(true)
        setTimeout(() => {
            this.router.navigate(['/app/learn']);
        }, 2000);
    }
}
