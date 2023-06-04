import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
} from '@angular/core';
import { TeacherTrainingService } from '../../../services/teacher-training.service';
import {
	Course,
	CourseBundleCreatePayload,
} from 'src/app/typings/course.types';
import { Observable, map, of, switchMap } from 'rxjs';
import { CoursesService } from 'src/app/services/courses.service';
import { NetworkRequestKey } from 'src/app/helpers/network.helper';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BundleService } from '../services/bundle.service';
import { CenteredContainerDirective } from 'src/app/directives/centered-container.directive';
import { Router } from '@angular/router';

@Component({
	selector: 'app-create',
	templateUrl: './create.component.html',
	styleUrls: ['./create.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent 
	extends CenteredContainerDirective
	implements OnInit 
{
	private originalCoursesRef: Course[] = [];
	public teacherCourses: Course[] = [];
	public searchCourses: Course[] = [];
	public bundleCourses: Course[] = [];
	public bundleForm;

	constructor(
		private courseService: CoursesService,
		private bundleService: BundleService,
		private userService: UserService,
		private router: Router,
		private cdRef: ChangeDetectorRef,
		private fb: FormBuilder
	) {
		super()
		
		this.bundleForm = this.fb.group({
			title: ['', Validators.required],
			description: ['', Validators.required],
			courses: [[] as Course[]],
		});
	}

	ngOnInit(): void {
		this.userService.user$
			.pipe(
				switchMap((user) => {
					return this.courseService.getCoursesForBundle(user.uuid)
				}),
				map((res) => res.data)
			)
			.subscribe((courses) => {
				this.originalCoursesRef = courses;
				this.searchCourses = courses;
				this.teacherCourses = courses;
				this.cdRef.detectChanges();
			});
	}

	public addToBundle(course: Course) {
		this.searchCourses = this.searchCourses.filter(
			(c) => c._id !== course._id
		);
		this.bundleCourses.push(course);
		this.bundleForm.controls.courses.setValue([
			...(this.bundleForm.value.courses ?? []),
			course,
		]);
		this.teacherCourses = this.searchCourses.slice()
	}

	public removeCourseFromBundle(course: Course) {
		this.bundleCourses = this.bundleCourses.filter(
			(c) => c._id !== course._id
		);
		this.bundleForm.controls.courses.setValue([...this.bundleCourses]);
		this.teacherCourses.push(course);
		this.searchCourses = this.teacherCourses.slice().sort((a, b) => {
			return (
				this.originalCoursesRef.indexOf(a) -
				this.originalCoursesRef.indexOf(b)
			);
		});
		this.teacherCourses = this.searchCourses.slice()
	}

	public createBundle() {
		const { value, invalid } = this.bundleForm;

		if (invalid) {
			console.warn('Invalid form');
			return;
		}

		this.userService.user$
			.pipe(
				switchMap((user) => {
					if (!value.courses || value.courses.length < 2) {
						return of(null);
					}

					if (user.permission !== 'teacher') {
						return of(null);
					}

					const body: CourseBundleCreatePayload = {
						title: value.title ?? '',
						description: value.description ?? '',
						courses: value.courses.map((c) => c._id),
						authorId: user._id,
					};

					return this.bundleService.createCoursesBundle(body);
				})
			)
			.subscribe((res) => {
				this.router.navigateByUrl('/app/teacher/bundle')
				console.log('course bundle created', res);
			});
	}

	public search(value: string) {
		const val = value.toLowerCase();
		this.searchCourses = this.originalCoursesRef.filter(c => {
			return c.title.toLowerCase().includes(val) && this.bundleCourses.findIndex(course => course._id === c._id) === -1
		})
		this.teacherCourses = this.searchCourses.slice()
	}
}
