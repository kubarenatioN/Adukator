import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TeacherTrainingService } from '../../services/teacher-training.service';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { FormBuilder, Validators } from '@angular/forms';
import { delay } from 'rxjs';

@Component({
  selector: 'app-start-training-submit',
  templateUrl: './start-training-submit.component.html',
  styleUrls: ['./start-training-submit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartTrainingSubmitComponent implements OnInit {

  public get now() {
    return new Date()
  }

  public form = this.fb.group({
    date: [null, Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StartTrainingSubmitComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { uuid: string },
    private teacherCourses: TeacherTrainingService,
  ) { }
  
  ngOnInit(): void {

  }

  public onSubmit(e: Event) {
    const date = this.form.value.date

    if (this.form.invalid || !date) {
      console.warn('Invalid form');
      return;
    }

    (e.target as HTMLButtonElement).disabled = true

    this.teacherCourses.startTraining({
      uuid: this.data.uuid,
      date: (date as Date).toUTCString(),
    })
    .pipe(delay(1000))
    .subscribe({
        next: res => {
          this.dialogRef.close(res.training)
        },
        error: err => {
          this.dialogRef.close('error')
        }
    })
    
  }

}
