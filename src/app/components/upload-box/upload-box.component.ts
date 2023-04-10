import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { from, map, Observable, Subscription } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserFile } from 'src/app/typings/files.types';

@Component({
	selector: 'app-upload-box',
	templateUrl: './upload-box.component.html',
	styleUrls: [
        './upload-box.component.scss'
    ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadBoxComponent implements OnInit, OnChanges, OnDestroy {
    // private _folder = ''
    public filesStore = new Map<string, { userFile: UserFile, uploadFile?: File }>();

    @Input() public folder = ''
    // @Input() public set folder(value: string) {
    //     this._folder = value;
    // }
    @Input() public type!: 'upload' | 'download';
    @Input() public controlId!: string;
    @Input() public control?: FormControl;
    @Input() public label?: string;
    @Input() public preloadExisting: boolean = false;
    @Input() public serveFrom: 'cloud' | 'local' = 'cloud';
    @Input() public set files(files: UserFile[]) {
        files.forEach(file => this.filesStore.set(file.filename, {
            userFile: file
        }))
    }

    @Output()
    public uploadFilesChanged = new EventEmitter<string[]>();
    
    public get fileInputId(): string {
        return `fileInput-${this.folder}`;
    }

    // public get folder() {
    //     return this._folder
    // }

    private filesUploadSubscription?: Subscription

	constructor(private uploadService: UploadService, private cd: ChangeDetectorRef, private cacheService: CacheService) {

    }
    
    public ngOnDestroy(): void {
        this.filesUploadSubscription?.unsubscribe()
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const { controlId, folder } = changes

        if (folder && folder.previousValue !== folder.currentValue) {
            this.refresh()
        }
    }

	public ngOnInit(): void {
        this.control?.valueChanges.subscribe((value: UserFile[]) => {
            if (value.length === 0) {
                this.clearBox();
            }
        })
    }

    public onChange(e: Event) {
        const files = (e.target as HTMLInputElement).files
        if (files) {
            this.onFilesDropped(files);
        }
    }

    public onFilesDropped(fileList: FileList) {
        if (this.folder === null) {
            return;
        }
        Array.from(fileList).forEach(file => {
            const fileExists = this.filesStore.has(file.name)
            if (fileExists) {
                return;
            }
            const userFile = this.formatFileToUserFile(file)
            this.filesStore.set(userFile.filename, {
                userFile,
                uploadFile: file,
            });
        })
        this.uploadFilesChanged.emit([...this.filesStore.values()].map(({ userFile }) => userFile.filename))
    }

    public onRemove(file: UserFile) {
        this.filesStore.delete(file.filename)
        if (this.folder) {
            this.uploadService.removeTempFile(file.filename, this.folder).subscribe()
            this.cacheService.removeFileFromCache(this.controlId, file)
        }
    }

    public onDownload({ filename, url }: UserFile) {
        if (url) {
            this.downloadFileFromRemote(url, filename).subscribe()
        }
    }

    public onUpload(file: UserFile) {
        this.cacheService.addFileToCache(this.controlId, file)
    }

    public refreshFiles(): void {
        this.refresh()
    }

    private refresh() {
        console.log('refresh upload box', this.controlId);
        this.filesUploadSubscription?.unsubscribe();
        this.clearBox()
        const cachedFiles = this.restoreFilesFromCache(this.controlId)
        if (cachedFiles.length > 0) {
            cachedFiles.forEach(file => this.filesStore.set(file.filename, {
                userFile: file
            }))
        } 
        else {
            // Preload files if specified and have 'upload' type or if have 'download' type
            const needPreloadForUpload = this.type === 'upload' && this.preloadExisting 
            if (needPreloadForUpload || this.type === 'download') {
                const getFrom = this.serveFrom === 'cloud' ? 'remote' : 'temp'
                this.filesUploadSubscription = this.getFilesFromFolder(this.folder, getFrom)
                .subscribe((files: UserFile[]) => {
                    files.forEach(file => {
                        this.filesStore.set(file.filename, {
                            userFile: file
                        })
                        this.cacheService.addFileToCache(this.controlId, file)
                    })
                    this.cd.detectChanges();
                });
            }
        }
    }

    private getFilesFromFolder(folder: string, type: 'temp' | 'remote'): Observable<UserFile[]> {
        return this.uploadService.getFilesFromFolder(folder, type)
            .pipe( map(res => res.files) )
    }

    private formatFileToUserFile(file: File): UserFile {
        return {
            filename: file.name,
            uploadedAt: new Date().toString()
        }
    }

    private restoreFilesFromCache(key: string) {
        const files = this.cacheService.filesCache.get(key) ?? []
        return files
    }

    private clearBox() {
        this.filesStore.clear();
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
