import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: 'app-upload-box',
	templateUrl: './upload-box.component.html',
	styleUrls: [
        './upload-box.component.scss'
    ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadBoxComponent implements OnInit {
    public files: File[] = []

	constructor(private dataService: DataService) {
    }

	ngOnInit(): void {
        
    }

    public onChange(e: Event) {
        const files = (e.target as HTMLInputElement).files
        if (files) {
            this.onFilesDropped(files);
        }
    }

    public onFilesDropped(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
                const fileIndex = this.files.findIndex(f => f.name === file.name && f.type === file.type)
                if (fileIndex === -1) {
                    this.files.push(file)
                    this.uploadFile(file)
                }
            }
        }
        console.log('files:', this.files);
    }

    public removeFile(index: number) {
        this.files = this.files.filter((_, i) => i !== index)
    }

    private uploadFile(file: File) {
        this.dataService.uploadFile(file);
    }

    private removeFileOnServer() {

    }
}
