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

@Component({
	selector: 'app-create',
	templateUrl: './create.component.html',
	styleUrls: ['./create.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit {
	private originalCoursesRef: Course[] = [];
	public teacherCourses: Course[] = [];
	public bundleCourses: Course[] = [];
	public bundleForm;

	constructor(
		private courseService: CoursesService,
		private bundleService: BundleService,
		private userService: UserService,
		private cdRef: ChangeDetectorRef,
		private fb: FormBuilder
	) {
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
					return this.courseService.getCourses<{ data: Course[] }>({
						requestKey: NetworkRequestKey.SelectCourses,
						reqId: NetworkRequestKey.SelectCourses,
						authorId: user.uuid,
						type: 'published',
					});
				}),
				map((res) => res.data)
			)
			.subscribe((courses) => {
				this.originalCoursesRef = courses;
				this.teacherCourses = courses;
				this.cdRef.detectChanges();
			});
	}

	public addToBundle(course: Course) {
		this.teacherCourses = this.teacherCourses.filter(
			(c) => c._id !== course._id
		);
		this.bundleCourses.push(course);
		this.bundleForm.controls.courses.setValue([
			...(this.bundleForm.value.courses ?? []),
			course,
		]);
	}

	public removeCourseFromBundle(course: Course) {
		this.bundleCourses = this.bundleCourses.filter(
			(c) => c._id !== course._id
		);
		this.bundleForm.controls.courses.setValue([...this.bundleCourses]);
		this.teacherCourses.push(course);
		this.teacherCourses = this.teacherCourses.slice().sort((a, b) => {
			return (
				this.originalCoursesRef.indexOf(a) -
				this.originalCoursesRef.indexOf(b)
			);
		});
	}

	public createBundle() {
		const { value } = this.bundleForm;

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
				console.log('course bundle created', res);
			});
	}
}
