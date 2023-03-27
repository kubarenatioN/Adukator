import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserFile, UserFileUI } from 'src/app/typings/files.types';

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
    private filesStore$ = new BehaviorSubject<UserFileUI[]>([]);
    
    @Input() public downloadOnly: boolean = false;
    @Input() public type: 'upload' | 'download' = 'upload';
    @Input() public set folder(value: string | null) {            
        this.filesStore$.next([]);
        if (value === null) {
            return;
        }
        this._folder = value;
        // TODO: apply files from cache
        this.getFilesFromFolder(value).subscribe(files => {
            this.filesStore$.next(files)
        });
    };

    @Output()
    public uploadFilesChanged = new EventEmitter<string[]>();
    
    public files$!: Observable<UserFileUI[] | null>;

    public get fileInputId(): string {
        let components = this.folder?.split('/');
        components?.shift()
        return `fileInput-${components?.join('-')}`;
    }

	constructor(private uploadService: UploadService) {
        this.files$ = this.filesStore$.asObservable();
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
        const uploaded = this.filesStore$.value ?? [];
        const toBeUploaded: UserFileUI[] = [...uploaded]
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList.item(i);
            if (file) {
                const fileIndex = uploaded.findIndex(f => f.filename === file.name)
                if (fileIndex === -1) {
                    this.uploadFile(file, this._folder)
                    toBeUploaded.push(this.formatFileToUserFile(file))
                }
            }
        }
        this.filesStore$.next(toBeUploaded);
    }

    public removeFile(index: number) {
        const remaining = this.filesStore$.value.filter((_, i) => i !== index)
        this.filesStore$.next(remaining);
    }

    private uploadFile(file: File, folder: string) {
        this.uploadService.uploadFile(file, folder)
        .subscribe(() => {
            this.uploadFilesChanged.emit(this.filesStore$.value?.map(file => file.filename));
        });
    }

    private removeFileFromServer() {

    }

    private getFilesFromFolder(folder: string) {
        return this.uploadService.getFilesFromFolder(folder)
            .pipe(
                map(res => res.resources)
            )
    }

    public downloadFile(filename: string, url?: string) {
        if (url) {   
            this.uploadService.downloadFile(url, filename).subscribe()
        }
    }

    private formatFileToUserFile(file: File): UserFileUI {
        return {
            filename: file.name,
        }
    }
}
