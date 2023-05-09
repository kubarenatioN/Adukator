import { Injectable } from '@angular/core';
import { UserFile } from '../typings/files.types';

@Injectable()
export class UploadCacheService {
	private materialsCache = new Map<string, UserFile[]>();

	public get filesCache() {
		return this.materialsCache;
	}
	constructor() {}

	public cacheFiles(controlId: string, files: UserFile[]) {
		this.materialsCache.set(controlId, files);
	}

	public addFileToCache(controlId: string, file: UserFile) {
		let files = this.materialsCache.get(controlId);
		if (!files) {
			files = [];
		}
		files.push(file);
		this.materialsCache.set(controlId, files);
	}

	public removeFileFromCache(controlId: string, file: UserFile) {
		let files = this.materialsCache.get(controlId);
		if (!files) {
			return;
		}
		files = files.filter((f) => f.filename !== file.filename);
		this.materialsCache.set(controlId, files);
	}

	public clearCache(controlId: string) {
		this.materialsCache.delete(controlId);
	}
}
