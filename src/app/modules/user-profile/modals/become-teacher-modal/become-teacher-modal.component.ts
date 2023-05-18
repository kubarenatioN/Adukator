import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-become-teacher-modal',
  templateUrl: './become-teacher-modal.component.html',
  styleUrls: ['./become-teacher-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BecomeTeacherModalComponent implements OnInit {
  public form
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BecomeTeacherModalComponent>,
  ) { 
    this.form = this.fb.group({
      motivation: ['', Validators.required]
    })
  }

  ngOnInit(): void {
  }

  public sendRequest() {
    const { invalid } = this.form
    if (invalid) {
      return;
    }

    const { value } = this.form
    
    this.dialogRef.close(value)
  }

}
