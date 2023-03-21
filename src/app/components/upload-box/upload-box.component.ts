import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
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
export class UploadBoxComponent implements OnInit {
    @Input() type: 'upload' | 'download' = 'upload';
    @Input() folder: string | null = null;

    @Output()
    public uploadFilesChanged = new EventEmitter<string[]>();
    
    public uploadFiles: File[] = []
    public downloadFiles$!: Observable<UserFile[]>;

    public get fileInputId(): string {
        let components = this.folder?.split('/');
        components?.shift()
        return `fileInput-${components?.join('-')}`;
    }

	constructor(private uploadService: UploadService) {
    }

	public ngOnInit(): void {
        if (this.type === 'download' && this.folder !== null) {
            this.downloadFiles$ = this.getFilesFromFolder(this.folder);
        }
    }

    public onChange(e: Event) {
        const files = (e.target as HTMLInputElement).files
        if (files) {
            this.onFilesDropped(files);
        }
    }

    public onFilesDropped(files: FileList) {
        if (this.folder === null) {
            return;
        }
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
                const fileIndex = this.uploadFiles.findIndex(f => f.name === file.name && f.type === file.type)
                if (fileIndex === -1) {
                    this.uploadFiles.push(file)
                    this.uploadFile(file, this.folder)
                }
            }
        }
    }

    public removeFile(index: number) {
        this.uploadFiles = this.uploadFiles.filter((_, i) => i !== index)
    }

    private uploadFile(file: File, folder: string) {
        this.uploadService.uploadFile(file, folder)
        .subscribe(() => {
            this.uploadFilesChanged.emit(this.uploadFiles.map(file => file.name));
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

    public downloadFile(url: string, filename: string) {
        this.uploadService.downloadFile(url, filename).subscribe()
    }
}
