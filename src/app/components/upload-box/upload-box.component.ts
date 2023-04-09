import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { CourseBuilderService } from 'src/app/modules/course-builder/services/course-builder.service';
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
export class UploadBoxComponent implements OnInit, OnChanges {
    private _folder: string = '';

    public filesStore = new Map<string, { userFile: UserFile, uploadFile?: File }>();

    @Input() public controlId!: string;
    @Input() public control?: FormControl;
    @Input() public label?: string;
    @Input() public preloadExisting: boolean = false;
    @Input() public type!: 'upload' | 'download';
    @Input() public set folder(value: string) {            
        // this.filesStore.clear();
        this._folder = value;
    };
    @Input() public set files(files: UserFile[]) {
        files.forEach(file => this.filesStore.set(file.filename, {
            userFile: file
        }))
    }

    @Output()
    public uploadFilesChanged = new EventEmitter<string[]>();
    
    public get folder(): string {
        return this._folder;
    }
    
    public get fileInputId(): string {
        return `fileInput-${this.folder}`;
    }

	constructor(private uploadService: UploadService, private cd: ChangeDetectorRef, private courseBuilder: CourseBuilderService) {

    }

    public ngOnChanges(changes: SimpleChanges): void {
        const { controlId } = changes
        if (!controlId.firstChange && controlId.previousValue !== controlId.currentValue) {
            this.refresh()
        }
    }

	public ngOnInit(): void {
        this.refresh()

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
        if (this._folder === null) {
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
            this.courseBuilder.removeFileFromCache(this.controlId, file)
        }
    }

    public onDownload({ filename, url }: UserFile) {
        if (url) {
            this.uploadService.downloadFile(url, filename).subscribe()
        }
    }

    public onUpload(file: UserFile) {
        this.courseBuilder.addFileToCache(this.controlId, file)
    }

    public refreshFiles(): void {
        this.refresh()
    }

    private refresh() {
        this.clearBox()
        const cachedFiles = this.restoreFilesFromCache(this.controlId)
        if (cachedFiles.length > 0) {
            cachedFiles.forEach(file => this.filesStore.set(file.filename, {
                userFile: file
            }))
            
        } else {
            if (this.type === 'download') {
                this.getFilesFromFolder(this.folder, 'remote').subscribe((files: UserFile[]) => {
                    files.forEach(file => {
                        this.filesStore.set(file.filename, {
                            userFile: file
                        })
                        this.courseBuilder.addFileToCache(this.controlId, file)
                    })
                    this.cd.detectChanges();
                });
            }
        }
    }

    private getFilesFromFolder(folder: string, type: 'temp' | 'remote'): Observable<UserFile[]> {
        return this.uploadService.getFilesFromFolder(folder, type)
            .pipe(
                map(res => {
                    const { resources } = res;
                    return resources.map(file => ({
                        filename: file.filename,
                        uploadedAt: file.uploaded_at,
                        url: file.url
                    }))
                })
            )
    }

    private formatFileToUserFile(file: File): UserFile {
        return {
            filename: file.name,
            uploadedAt: new Date().toString()
        }
    }

    private restoreFilesFromCache(key: string) {
        const files = this.courseBuilder.filesCache.get(key) ?? []
        return files
    }

    private clearBox() {
        this.filesStore.clear();
    }
}
