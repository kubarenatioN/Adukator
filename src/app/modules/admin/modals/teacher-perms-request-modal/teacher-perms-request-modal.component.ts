import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LightGalleryAllSettings } from 'lightgallery/lg-settings';
import { BecomeTeacherModalComponent } from 'src/app/modules/user-profile/modals/become-teacher-modal/become-teacher-modal.component';
import { UserTeacherPermsRequest } from 'src/app/typings/user.types';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumb from 'lightgallery/plugins/thumbnail';

type DialogData = {
  req: UserTeacherPermsRequest
}



@Component({
  selector: 'app-teacher-perms-request-modal',
  templateUrl: './teacher-perms-request-modal.component.html',
  styleUrls: ['./teacher-perms-request-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeacherPermsRequestModalComponent implements OnInit {
  // public lgSettings = LightgallerySettings
  // public req: UserTeacherPermsRequest

  constructor(
    public dialogRef: MatDialogRef<BecomeTeacherModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
  ) {
    // this.req = data.req
  }

  ngOnInit(): void {

  }

}
