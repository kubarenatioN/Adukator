import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { apiUrl } from '../constants/urls';
import { CourseFilesResponse } from '../typings/response.types';

@Injectable({
	providedIn: 'root',
})
export class UploadService {
	constructor(private http: HttpClient) {}

	public uploadFile(file: File, folder: string): Observable<unknown> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('folder', folder);
		// formData.append('folder', 'course-1/module-3/topic-4')
		return this.http.post(`${apiUrl}/upload`, formData);
	}

	public getFilesFromFolder(folder: string): Observable<CourseFilesResponse> {
		folder = encodeURIComponent(folder);
		return this.http
			.get<CourseFilesResponse>(`${apiUrl}/upload/files`, {
				params: {
					folder,
				},
			})
			.pipe(
				map((res) => {
					let { resources } = res;
					resources = resources.map((file) => {
						if (file.resource_type === 'image') {
							file.filename = `${file.filename}.${file.format}`;
						}
						return file;
					});
					res.resources = resources;
					return res;
				})
			);
	}

	public downloadFile(url: string, filename: string) {
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
