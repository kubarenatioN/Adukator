import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { format } from 'date-fns/esm';
import { Observable, Subscription, from, map, of, tap } from 'rxjs';
import { UploadCacheService } from 'src/app/services/upload-cache.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserFile } from 'src/app/typings/files.types';

const filesFromRemoteMock = {
  "files": [
      {
          "filename": "cameras.response-08.05.23:23:54.json",
          "uploadedAt": "2023-05-08T21:54:39+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683579279/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:54.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:52.json",
          "uploadedAt": "2023-05-08T21:52:23+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683579143/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:52.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:51.json",
          "uploadedAt": "2023-05-08T22:52:01+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683579121/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:51.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:49.json",
          "uploadedAt": "2023-05-08T22:49:40+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683578980/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:49.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:46.json",
          "uploadedAt": "2023-05-08T23:46:57+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683578817/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:46.json"
      },
      {
          "filename": "camera-group.response-08.05.23:23:46.json",
          "uploadedAt": "2023-05-08T23:46:54+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683578814/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/camera-group.response-08.05.23:23:46.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:42.json",
          "uploadedAt": "2023-05-08T19:43:09+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683578589/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:42.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:40.json",
          "uploadedAt": "2023-05-08T19:41:16+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683578476/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:40.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:37.json",
          "uploadedAt": "2023-05-08T19:37:39+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683578259/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:37.json"
      },
      {
          "filename": "cameras.response-08.05.23:23:33.json",
          "uploadedAt": "2023-05-08T20:33:14+00:00",
          "url": "https://res.cloudinary.com/dzg3gqpxf/raw/upload/v1683577994/training/if6Br4Lltm6hT_UjRcBza/406dVwBfj7zz6-9hJHb31/cameras.response-08.05.23:23:33.json"
      }
  ],
  "total": 10
}

@Component({
  selector: 'app-grouping-upload-box',
  templateUrl: './grouping-upload-box.component.html',
  styleUrls: ['./grouping-upload-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupingUploadBoxComponent implements OnInit, OnChanges, OnDestroy {
  public filesStore: { date: string, files: UserFile[]}[] = []

  @Input() public folder = ''
  @Input() public controlId!: string;
  @Input() public label?: string;
  @Input() public useCache: boolean = true;
  
  private filesUploadSubscription?: Subscription
  private get cacheKey() {
    return this.folder
  }

  constructor(
    private cacheService: UploadCacheService,
    private uploadService: UploadService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { folder } = changes

    if (folder && folder.previousValue !== folder.currentValue) {
        this.refresh()
    }
  }

  ngOnDestroy(): void {
    this.filesUploadSubscription?.unsubscribe()
  }

  private refresh() {
    if (!this.folder) {
        return;
    }

    this.filesUploadSubscription?.unsubscribe();
    const cachedFiles = this.restoreFilesFromCache(this.cacheKey)
    if (this.useCache && cachedFiles.length > 0) {
        this.filesStore = this.groupFiles(cachedFiles)
    } 
    else {
        if (!this.folder) {
            return;
        }
        this.filesUploadSubscription = this.getFilesFromFolder(this.folder)
        .subscribe((files: UserFile[]) => {
            files.forEach(file => {
              this.cacheService.addFileToCache(this.cacheKey, file)
            })
            const groupedFiles = this.groupFiles(files)
            this.filesStore = groupedFiles
            this.cd.detectChanges();
        });
    }
  }

  private getFilesFromFolder(folder: string): Observable<UserFile[]> {
    // DEBUG
    // return of(filesFromRemoteMock)
    //   .pipe(
    //     map(res => res.files)
    //   )
    return this.uploadService.getFilesFromFolder(folder, 'remote')
      .pipe(
        map(res => res.files)
      )
  }

  private groupFiles(files: UserFile[]) {
    return files.reduce((acc, file) => {
      let uploadTime = file.uploadedAt
      if (uploadTime) {
        const fixedUploadTime = new Date(uploadTime)
        fixedUploadTime.setMinutes(0)
        fixedUploadTime.setSeconds(0)
        uploadTime = format(fixedUploadTime, 'dd.MM.yy HH:mm')
        const record = acc.find(item => item.date === uploadTime)
        if (!record) {
          acc.push({
            date: uploadTime,
            files: [file]
          })
        } else {
          record.files.push(file)
        }
      }
      return acc
    }, [] as typeof this.filesStore)
  }

  private restoreFilesFromCache(key: string) {
    const files = this.cacheService.filesCache.get(key) ?? []
    return files
  }

  public onDownload({ filename, url }: UserFile) {
    if (url) {
        this.downloadFileFromRemote(url, filename).subscribe()
    }
  }

  private downloadFileFromRemote(url: string, filename: string) {
		return from(
			new Promise(async (res, rej) => {
				const data = await fetch(url);
				const blob = await data.blob();
				const objectUrl = URL.createObjectURL(blob);

				const link = document.createElement('a');
				link.setAttribute('href', objectUrl);
				link.setAttribute('download', filename);
				link.style.display = 'none';

				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				res('success');
			})
		);
	}

}
