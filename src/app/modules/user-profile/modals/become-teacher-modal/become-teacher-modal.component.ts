import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { merge } from 'rxjs';
import { User } from 'src/app/typings/user.types';

type DialogData = {
  user: User,
  dispose: EventEmitter<void>,
  clear$: EventEmitter<void>,
}

@Component({
  selector: 'app-become-teacher-modal',
  templateUrl: './become-teacher-modal.component.html',
  styleUrls: ['./become-teacher-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BecomeTeacherModalComponent implements OnInit {
  public clearBox$ = new EventEmitter<void>()
  
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
    this.form = this.fb.group({
      motivation: ['', Validators.required],
      files: [new Array<string>(), Validators.minLength(1)],
    })
  }

  ngOnInit(): void {
    merge(
      this.data.dispose,
      this.data.clear$
    ).subscribe(() => this.clearBox$.emit())
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
