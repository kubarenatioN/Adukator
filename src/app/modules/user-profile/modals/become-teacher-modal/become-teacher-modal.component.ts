import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/typings/user.types';

type DialogData = {
  user: User,
  dispose: EventEmitter<void>
}

@Component({
  selector: 'app-become-teacher-modal',
  templateUrl: './become-teacher-modal.component.html',
  styleUrls: ['./become-teacher-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BecomeTeacherModalComponent implements OnInit {
  public form
  public get requestFilesFolder(): string {
    return `teacher-perms-request/${this.data.user.uuid}`
  }
	@Input() public disposeLocalFiles$!: EventEmitter<void>

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BecomeTeacherModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
  ) {
    this.disposeLocalFiles$ = data.dispose
    this.form = this.fb.group({
      motivation: ['', Validators.required],
      files: [new Array<string>(), Validators.minLength(1)],
    })
  }

  ngOnInit(): void {
  }

  public uploadFilesChanged(files: string[]) {
    this.form.controls.files.setValue(files)
  }

  public sendRequest() {
    const { invalid } = this.form
    if (invalid) {
      return;
    }

    const { value } = this.form

    if (value.files?.length === 0) {
      return;
    }
    
    this.dialogRef.close(value)
  }

}
