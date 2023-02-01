import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormGroup } from '@angular/forms';
import {
	MatDialog,
	MAT_DIALOG_DATA,
	MatDialogRef,
} from '@angular/material/dialog';
import { CreateTopicDialogComponent } from '../create-topic-dialog/create-topic-dialog.component';

@Component({
	selector: 'app-course-module',
	templateUrl: './course-module.component.html',
	styleUrls: ['./course-module.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseModuleComponent implements OnInit {
	@Input() public form!: FormGroup;

	@Output() public changeTitle = new EventEmitter<string>();

	public get topics(): FormArray {
		return this.form.get('topics') as FormArray;
	}

	public get title(): string {
		if (this.form) {
			return this.form.get('title')?.value || '';
		}
		return '';
	}

	constructor(
		private dialog: MatDialog,
		private cd: ChangeDetectorRef
	) {}

	public ngOnInit(): void {
		this.form.valueChanges.subscribe((res) => {
			console.log('111 module form changed', res);
		});
	}

	public openCreateTopicDialog(form: FormGroup | null = null): void {
		const isNewForm = form === null;
		const dialogRef = this.dialog.open(CreateTopicDialogComponent, {
			data: {
				form,
				isNewForm,
			},
			panelClass: 'create-topic-panel',
		});

		dialogRef
			.afterClosed()
			.subscribe((result: { form: FormGroup | null }) => {
                if (result === undefined) {
                    return;
                }
				const { form } = result;
				if (form !== null) {
					if (isNewForm) {
						this.topics.push(form);
					}
					this.cd.markForCheck();
				}
			});
	}

	public onEditTopic(index: number) {
		const topicForm = this.topics.at(index) as FormGroup;
		this.openCreateTopicDialog(topicForm);
	}

	public onRemoveTopic(index: number) {
		this.topics.removeAt(index);
	}

    public drop(event: CdkDragDrop<FormGroup[]>) {
		moveItemInArray(
			this.topics.controls,
			event.previousIndex,
			event.currentIndex
		);
        this.form.controls['topics'].patchValue(
            [...this.topics.controls],
        )
	}
}
