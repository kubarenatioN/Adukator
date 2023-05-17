import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { from, map, Observable, Subscription } from 'rxjs';
import { UploadCacheService } from 'src/app/services/upload-cache.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserFile } from 'src/app/typings/files.types';

@Component({
	selector: 'app-upload-box',
	templateUrl: './upload-box.component.html',
	styleUrls: ['./upload-box.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadBoxComponent implements OnInit, OnChanges, OnDestroy {
	public filesStore = new Map<
		string,
		{ userFile: UserFile; uploadFile?: File }
	>();

	@Input() public folder = '';
	@Input() public type!: 'upload' | 'download';
	@Input() public controlId?: string;
	@Input() public label?: string;
	@Input() public preloadExisting: boolean = false;
	@Input() public useCache: boolean = true;
	@Input() public serveFrom: 'cloud' | 'local' = 'cloud';
	@Input() public autoRemoveOnDestroy = true;
	@Input() public appendTimestamp = false;

	@Input() public clearObs$?: EventEmitter<void>;

	@Output()
	public uploadFilesChanged = new EventEmitter<string[]>();

	@ViewChild('fileInput')
	public fileInputRef!: ElementRef<HTMLInputElement>;

	public get fileInputId(): string {
		return `fileInput-${this.folder}`;
	}

	private filesUploadSubscription?: Subscription;
	private get cacheKey() {
		return this.folder;
	}

	constructor(
		private uploadService: UploadService,
		private cd: ChangeDetectorRef,
		private cacheService: UploadCacheService
	) {}

	public ngOnDestroy(): void {
		this.filesUploadSubscription?.unsubscribe();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		const { folder } = changes;

		if (folder && folder.previousValue !== folder.currentValue) {
			this.refresh();
		}
	}

	public ngOnInit(): void {
		this.clearObs$?.subscribe(() => {
			if (this.controlId) {
				this.cacheService.clearCache(this.controlId);
				this.clearBox();
			} else {
				throw new Error('No control ID provided')
			}
		});
	}

	public onChange(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (files) {
			this.onFilesDropped(files);
		}
	}

	public onFilesDropped(fileList: FileList) {
		if (this.folder === null) {
			return;
		}
		Array.from(fileList).forEach((file) => {
			const fileExists = this.filesStore.has(file.name);
			if (fileExists) {
				return;
			}
			const userFile = this.formatFileToUserFile(file);
			this.filesStore.set(userFile.filename, {
				userFile,
				uploadFile: file,
			});
		});
		this.uploadFilesChanged.emit(
			[...this.filesStore.values()].map(
				({ userFile }) => userFile.filename
			)
		);
	}

	public onRemove(data: { file: UserFile; timestamp: string }) {
		const { file, timestamp } = data;
		this.filesStore.delete(file.filename);
		if (this.folder) {
			this.uploadService
				.removeTempFile(file.filename, this.folder, this.appendTimestamp ? timestamp : undefined)
				.subscribe();
			this.cacheService.removeFileFromCache(this.cacheKey, file);
		}
	}

	public onDownload({ filename, url }: UserFile) {
		if (url) {
			this.downloadFileFromRemote(url, filename).subscribe();
		}
	}

	public onUpload(file: UserFile) {
		if (this.useCache) {
			this.cacheService.addFileToCache(this.cacheKey, file);
		}
	}

	public refreshFiles(): void {
		this.refresh();
	}

	private refresh() {
		if (!this.folder) {
			return;
		}

		this.filesUploadSubscription?.unsubscribe();
		this.clearBox();

		const cachedFiles = this.restoreFilesFromCache(this.cacheKey);
		if (this.useCache && cachedFiles.length > 0) {
			cachedFiles.forEach((file) =>
				this.filesStore.set(file.filename, {
					userFile: file,
				})
			);
		} else {
			// Preload files if specified and have 'upload' type or if have 'download' type
			const needPreloadForUpload =
				this.type === 'upload' && this.preloadExisting;
			if (needPreloadForUpload || this.type === 'download') {
				const getFrom = this.serveFrom === 'cloud' ? 'remote' : 'temp';
				if (!this.folder) {
					return;
				}
				this.filesUploadSubscription = this.getFilesFromFolder(
					this.folder,
					getFrom
				).subscribe((files: UserFile[]) => {
					files.forEach((file) => {
						this.filesStore.set(file.filename, {
							userFile: file,
						});
						this.cacheService.addFileToCache(this.cacheKey, file);
					});
					this.cd.detectChanges();
				});
			}
		}
	}

	private getFilesFromFolder(
		folder: string,
		type: 'temp' | 'remote'
	): Observable<UserFile[]> {
		return this.uploadService
			.getFilesFromFolder(folder, type)
			.pipe(map((res) => res.files));
	}

	private formatFileToUserFile(file: File): UserFile {
		return {
			filename: file.name,
			uploadedAt: new Date().toUTCString(),
		};
	}

	private restoreFilesFromCache(key: string) {
		const files = this.cacheService.filesCache.get(key) ?? [];
		return files;
	}

	public clearBox() {
		if (this.fileInputRef) {
			this.fileInputRef.nativeElement.value = '';
		}
		this.filesStore.clear();
		this.cd.markForCheck();
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
