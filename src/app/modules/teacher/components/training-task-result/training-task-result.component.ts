import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TopicTask } from 'src/app/typings/course.types';
import { ProfileProgressRecord } from 'src/app/typings/training.types';

@Component({
	selector: 'app-training-task-result',
	templateUrl: './training-task-result.component.html',
	styleUrls: ['./training-task-result.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingTaskResultComponent implements OnInit {
	@Input()
	public task!: TopicTask;

	@Input()
	public form!: FormGroup<{
		mark: FormControl<number>;
		isCounted: FormControl<boolean>;
	}>;

	@Output()
	public resultChange = new EventEmitter<ProfileProgressRecord>();

	constructor() {}

	ngOnInit(): void {
		// console.log(this.form);
		this.form.valueChanges.subscribe((model) => {
			// console.log(model);
		});
	}
}
