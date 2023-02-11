import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
} from '@angular/core';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import { CourseFormData } from 'src/app/typings/course.types';
import { testFormData } from '../course-form/course-form.component';

@Component({
	selector: 'app-create-course',
	templateUrl: './create-course.component.html',
	styleUrls: ['./create-course.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent {
	private courseData?: CourseFormData;

    public formData: CourseFormData = testFormData;

	constructor(private dataService: DataService) {
	}

    public onPulish(courseData: CourseFormData): void {
        console.log('111 on change form Data', courseData);
        this.courseData = courseData
    }

    public onSaveDraft(courseDraft: CourseFormData): void {
        console.log('111 on save draft', courseDraft);
    }

    public publishCourse() {
        // const processedCourseData = this.processCourseFormData(data);
		const payload = NetworkHelper.createRequestPayload(
			NetworkRequestKey.CreateCourse,
			{
				course: this.courseData,
			}
		);
		this.dataService.send(payload).subscribe((res) => {
			console.log('111 create course response', res);
		});
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
}
