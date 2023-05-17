import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import { getCurrentTime } from 'src/app/helpers/date-fns.helper';
import { UploadService } from 'src/app/services/upload.service';
import { UserFile } from 'src/app/typings/files.types';

@Component({
	selector: 'app-file-item',
	templateUrl: './file-item.component.html',
	styleUrls: ['./file-item.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileItemComponent implements OnInit, OnDestroy {
	private submitted = false;
	private manualRemove = false;
	private timestamp!: string;

	public progress: string = this.formatProgress(1);

	@Input() public autoRemoveOnDestroy = true;
	@Input() folder!: string;
	@Input() userFile!: UserFile;
	@Input() file?: File;
	@Input() type!: 'upload' | 'download';
	@Input() clearObs$?: EventEmitter<void>;
	@Input() appendTimestamp = false;

	@Output() download = new EventEmitter<UserFile>();
	@Output() uploaded = new EventEmitter<UserFile>();
	@Output() remove = new EventEmitter<{
		file: UserFile;
		timestamp: string;
	}>();

	constructor(
		private uploadService: UploadService,
		private cd: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.timestamp = getCurrentTime();
		if (this.type === 'upload' && this.file && this.folder) {
			this.uploadService
				.uploadFile(this.folder, this.file, this.appendTimestamp ? this.timestamp : undefined)
				.subscribe((e) => this.handleUploadEvent(e));
		}

		this.clearObs$?.subscribe(() => (this.submitted = true));
	}

	public ngOnDestroy(): void {
		if (
			this.autoRemoveOnDestroy &&
			this.type === 'upload' &&
			!this.manualRemove &&
			!this.submitted
		) {
			this.onRemove();
		}
	}

	public onDownload() {
		this.download.emit(this.userFile);
	}

	public onRemove() {
		this.manualRemove = true;
		this.remove.emit({ file: this.userFile, timestamp: this.timestamp });
	}

	private handleUploadEvent(e: HttpEvent<{ file: UserFile }>) {
		switch (e.type) {
			case HttpEventType.Response: {
				if (e.body) {
					const { file } = e.body;
					this.uploaded.emit(file);
				}
				this.progress = this.formatProgress(1);
				break;
			}
			case HttpEventType.UploadProgress: {
				const { loaded, total } = e;
				if (total) {
					this.progress = this.formatProgress(loaded / total);
					this.cd.detectChanges();
				}
				break;
			}

			default:
				break;
		}
	}

	private formatProgress(progress: number): string {
		return `${progress * 100}px`;
	}
}
