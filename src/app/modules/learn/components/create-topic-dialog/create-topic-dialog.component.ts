import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-create-topic-dialog',
	templateUrl: './create-topic-dialog.component.html',
	styleUrls: ['./create-topic-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTopicDialogComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<CreateTopicDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { form: FormGroup }
	) {}

	public ngOnInit(): void {
        
    }

	public onSaveTopic(topicForm: FormGroup): void {
        this.dialogRef.close({form: topicForm});
	}
}
