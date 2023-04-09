import { Injectable } from '@angular/core';
import { generateUUID } from 'src/app/helpers/courses.helper';
import { UploadHelper } from 'src/app/helpers/upload.helper';
import { UserFile } from 'src/app/typings/files.types';

@Injectable({
	providedIn: 'root',
})
export class CourseBuilderService {
	public courseId: string;

    private materialsCache = new Map<string, UserFile[]>()

    public get filesCache() {
        return this.materialsCache
    }

	constructor() {
        this.courseId = generateUUID()
    }

    public cacheFiles(controlId: string, files: UserFile[]) {
        this.materialsCache.set(controlId, files)
    }

    public addFileToCache(controlId: string, file: UserFile) {
        let files = this.materialsCache.get(controlId);
        if (!files) {
            files = []
        }
        files.push(file)
        this.materialsCache.set(controlId, files)
    }

    public removeFileFromCache(controlId: string, file: UserFile) {
        let files = this.materialsCache.get(controlId);
        if (!files) {
            return
        }
        files = files.filter(f => f.filename !== file.filename)
        this.materialsCache.set(controlId, files)
    }

    public getFilesFolder(type?: string, controlId?: string) {
        if (this.courseId) {
            return `${this.courseId}/${type ?? ''}/${controlId ?? ''}`
        }
        return ''
    }
}
