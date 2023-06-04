import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/typings/user.types';
import { BecomeTeacherModalComponent } from '../become-teacher-modal/become-teacher-modal.component';
import { CourseCompetency } from 'src/app/typings/course.types';
import { merge, takeUntil } from 'rxjs';
import { BaseComponent } from 'src/app/shared/base.component';
import { generateUUID } from 'src/app/helpers/courses.helper';

type DialogData = {
  user: User,
  dispose: EventEmitter<void>,
  competencies: CourseCompetency[]
}

@Component({
  selector: 'app-request-competencies-modal',
  templateUrl: './request-competencies-modal.component.html',
  styleUrls: ['./request-competencies-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestCompetenciesModalComponent extends BaseComponent implements OnInit {
  public requestUUID = generateUUID()
  public form
  public get requestFilesFolder(): string {
    return `competencies-request/${this.data.user.uuid}/${this.requestUUID}`
  }
  public get comps() {
    return this.data.competencies ?? []
  }
  public clearBox$ = new EventEmitter<void>()

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RequestCompetenciesModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
  ) {
    super()
    this.form = this.fb.group({
      comps: [[], Validators.required],
      files: [new Array<string>(), Validators.minLength(1)],
    })

    merge(
      data.dispose
    )
    .pipe(takeUntil(this.componentLifecycle$))
    .subscribe(() => this.clearBox$.emit())
  }
  
  ngOnInit(): void {
  }

  public uploadFilesChanged(files: string[]) {
    this.form.controls.files.setValue(files)
  }

  public send() {
    const { invalid } = this.form
    if (invalid) {
      return;
    }

    const { value } = this.form

    if (value.files?.length === 0) {
      return;
    }
    
    this.dialogRef.close({
      form: value,
      requestId: this.requestUUID
    })
  }
}
