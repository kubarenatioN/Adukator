import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
    Output,
} from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { UserFile } from 'src/app/typings/files.types';

@Component({
	selector: 'app-file-item',
	templateUrl: './file-item.component.html',
	styleUrls: ['./file-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileItemComponent implements OnInit {
    private shouldCancelUpload = true;
    
    public progress: string = this.formatProgress(1);
    
	@Input() folder!: string;
	@Input() userFile!: UserFile;
	@Input() file?: File;
	@Input() type!: 'upload' | 'download';
    @Input() controlId!: string;

    @Output() download = new EventEmitter<UserFile>()
    @Output() uploaded = new EventEmitter<UserFile>()
    @Output() remove = new EventEmitter<UserFile>()
    
	constructor(private uploadService: UploadService, private cd: ChangeDetectorRef) {}

	ngOnInit(): void {
        if (this.type === 'upload' && this.file && this.folder) {
            this.uploadService.uploadFile(this.folder, this.file, 'folder-to-be-removed')
                .subscribe(e => this.handleUploadEvent(e))
        }
    }

    public onDownload() {
        this.download.emit(this.userFile)
    }

    public onRemove() {
        this.remove.emit(this.userFile);
    }

    private handleUploadEvent(e: HttpEvent<{ file: UserFile }>) {
        switch (e.type) {
            case HttpEventType.Response: {
                if (e.body) {
                    const { file } = e.body
                    this.uploaded.emit(file);
                }
                this.progress = this.formatProgress(1);
                break;
            }
            case HttpEventType.UploadProgress: {
                const { loaded, total } = e;
                if (total) {
                    this.progress = this.formatProgress(loaded / total)
                    this.cd.detectChanges();
                }
                break;
            }
        
            default:
                break;
        }
    }

    private formatProgress(progress: number): string {
        return `${progress * 100}px`
    }
}
