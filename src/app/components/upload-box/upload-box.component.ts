import { HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { UploadService } from 'src/app/services/upload.service';
import { CloudinaryFile, UserFile } from 'src/app/typings/files.types';

@Component({
	selector: 'app-upload-box',
	templateUrl: './upload-box.component.html',
	styleUrls: [
        './upload-box.component.scss'
    ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadBoxComponent implements OnInit {
    private _folder: string | null = null;

    public filesStore = new Map<string, { userFile: UserFile, uploadFile?: File }>();

    @Input() public label?: string;
    @Input() public downloadOnly: boolean = false;
    @Input() public preloadExisting: boolean = false;
    @Input() public type!: 'upload' | 'download';
    @Input() public set folder(value: string | null) {            
        this.filesStore.clear();
        if (value === null) {
            return;
        }
        this._folder = value;
        // TODO: apply files from cache
        if (this.preloadExisting) {
            this.getFilesFromFolder(value).subscribe((files: UserFile[]) => {
                files.forEach(file => this.filesStore.set(file.filename, {
                    userFile: file
                }))
                this.cd.detectChanges();
            });
        }
    };

    @Output()
    public uploadFilesChanged = new EventEmitter<string[]>();
    
    public get folder(): string {
        return this._folder || '';
    }
    
    public get fileInputId(): string {
        return `fileInput-${this.folder}`;
    }

	constructor(private uploadService: UploadService, private cd: ChangeDetectorRef) {

    }

	public ngOnInit(): void {

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
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList.item(i);
            if (file) {
                const fileExists = this.filesStore.has(file.name)
                if (!fileExists) {
                    const userFile = this.formatFileToUserFile(file)
                    this.filesStore.set(userFile.filename, {
                        userFile,
                        uploadFile: file,
                    });
                }
            }
        }
        
    }

    public removeFile(filename: string) {
        this.filesStore.delete(filename)
    }

    // private uploadFile(file: File, folder: string) {
    //     this.uploadService.uploadFile(file, folder)
    //     .subscribe(event => {
    //         switch (event.type) {
    //             case HttpEventType.Response: {
    //                 this.uploadFilesChanged.emit([...this.filesStore.values()].map(file => file.filename));
    //                 break;
    //             }
    //             case HttpEventType.UploadProgress: {
    //                 this.handleUploadProgress(event);
    //                 break;
    //             }
            
    //             default:
    //                 break;
    //         }
    //     });
    // }

    private removeFileFromServer() {

    }

    private getFilesFromFolder(folder: string): Observable<UserFile[]> {
        return this.uploadService.getFilesFromFolder(folder)
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

    public downloadFile({ filename, url }: UserFile) {
        if (url) {   
            this.uploadService.downloadFile(url, filename).subscribe()
        }
    }

    private formatFileToUserFile(file: File): UserFile {
        return {
            filename: file.name,
            uploadedAt: new Date().toString()
        }
    }

    private handleUploadProgress(e: HttpProgressEvent) {
        console.log(e);
    }
}
