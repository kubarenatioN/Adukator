import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../constants/urls';
import { CloudinaryFile, UserFile } from '../typings/files.types';
import {
	CloudinaryFilesResponse,
	CourseFilesResponse,
} from '../typings/response.types';

export type UploadPathSegment = 'tasks' | 'topics' | 'training' | 'poster';
export interface FileUploadHttpResponse {
	filename: string; file: UserFile, tempFolder: string
}

@Injectable({
	providedIn: 'root',
})
export class UploadService {
	constructor(private http: HttpClient) {}

	public uploadFile(tempFolder: string, file: File, timestamp?: string) {
		const formData = new FormData();
		formData.append('tempFolder', tempFolder);
		if (timestamp) {
			formData.append('timestamp', timestamp);
		}
		formData.append('file', file);

		return this.http.post<FileUploadHttpResponse>(
			`${apiUrl}/upload`,
			formData,
			{
				reportProgress: true,
				observe: 'events',
			}
		);
	}

	public getFilesFromFolder(
		folder: string,
		type: 'temp' | 'remote'
	): Observable<CourseFilesResponse> {
		folder = encodeURIComponent(folder);
		if (type === 'remote') {
			return this.getFilesFromCloud(folder);
		}
		return this.getFilesFromLocal(folder);
	}

	public removeTempFile(filename: string, folder: string, timestamp?: string) {
		return this.http.post(`${apiUrl}/upload/temp/delete`, {
			filename,
			folder,
			timestamp,
		});
	}

	public removeRemoteFolder(folder: string) {
		return this.http.delete(`${apiUrl}/upload/temp/delete`, {
			body: { folder }
		});
	}

	public removeRemoteFiles(files: string[]) {
		return this.http.delete(`${apiUrl}/upload/remote/files`, {
			body: { files }
		})
	}

	public moveFilesToRemote({
		fromFolder,
		toFolder,
		subject,
	}: {
		subject: 'course:build' | 'training:task' | 'personalization:task' | 'teacher-perms:request-files';
		fromFolder: string;
		toFolder?: string;
	}) {
		return this.http.post<{ result: { results: CloudinaryFile[], total: number, success: number } }>(`${apiUrl}/upload/remote`, {
			fromFolder,
			toFolder,
			subject,
		});
	}

	public getFilesFolder(...segments: string[]) {
		return segments.filter(Boolean).join('/');
	}

	private getFilesFromCloud(folder: string): Observable<CourseFilesResponse> {
		return this.http
			.get<CloudinaryFilesResponse>(`${apiUrl}/upload/files`, {
				params: {
					type: 'remote',
					folder,
				},
			})
			.pipe(
				map((res) => {
					let { resources } = res;
					const files: UserFile[] = resources.map((file) => {
						if (file.resource_type === 'image') {
							file.filename = `${file.filename}.${file.format}`;
						}
						return {
							filename: file.filename,
							uploadedAt: file.uploaded_at,
							url: file.secure_url,
						};
					});

					return {
						files,
						total: res.total_count,
					};
				})
			);
	}

	private getFilesFromLocal(folder: string): Observable<CourseFilesResponse> {
		return this.http.get<CourseFilesResponse>(`${apiUrl}/upload/files`, {
			params: {
				type: 'temp',
				folder,
			},
		});
	}
}
