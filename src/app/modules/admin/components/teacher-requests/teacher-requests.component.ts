import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, finalize, shareReplay } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { UserTeacherPermsRequest } from 'src/app/typings/user.types';
import lgZoom from 'lightgallery/plugins/zoom';
import { LightGalleryAllSettings } from 'lightgallery/lg-settings';

const LightgallerySettings: Partial<LightGalleryAllSettings> = {
  height: '300px',
  width: '600px',
  plugins: [lgZoom]
}

@Component({
  selector: 'app-teacher-requests',
  templateUrl: './teacher-requests.component.html',
  styleUrls: ['./teacher-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeacherRequestsComponent implements OnInit {
  private requestsStore$ = new BehaviorSubject<UserTeacherPermsRequest[] | null>(null)
  
  public lgSettings = LightgallerySettings
  public isLoading = false
  public requests$ = this.requestsStore$.asObservable().pipe(shareReplay(1))

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.getItems()
  }

  public approve(e: Event, req: UserTeacherPermsRequest) {
    e.stopPropagation()
    this.isLoading = true
    this.adminService.updateTeacherPermsRequest(req.user._id, {
      status: 'approved'
    })
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: res => {
        this.getItems()
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public reject(e: Event, req: UserTeacherPermsRequest) {
    e.stopPropagation()
    this.isLoading = true
    this.adminService.updateTeacherPermsRequest(req.user._id, {
      status: 'rejected'
    })
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: res => {
        this.getItems()
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public getStatus(req: UserTeacherPermsRequest) {
    switch (req.status) {
      case 'approved':
        return 'Одобрено'
        
      case 'pending':
        return 'В ожидании'

      case 'rejected':
        return 'Отклонено'
        
      default:
        return ''
    }
  }

  private getItems() {
    this.adminService.getUserTeacherPermsRequests().subscribe(data => {
      this.requestsStore$.next(data)
    })
  }
}
