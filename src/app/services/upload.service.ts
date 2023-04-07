import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { apiUrl } from '../constants/urls';
import { UserFile } from '../typings/files.types';
import { CourseFilesResponse } from '../typings/response.types';

@Injectable({
	providedIn: 'root',
})
export class UploadService {    
	constructor(private http: HttpClient) {}

	public uploadFile(tempFolder: string, file: File, remoteFolder: string) {
		const formData = new FormData();
		formData.append('tempFolder', tempFolder);
		formData.append('file', file);
		formData.append('folder', remoteFolder);
        
		return this.http.post<{ filename: string, file: UserFile }>(`${apiUrl}/upload`, formData, {
            reportProgress: true,
            observe: 'events',
        });
	}
    
	public getFilesFromFolder(folder: string, type: 'temp' | 'remote'): Observable<CourseFilesResponse> {
		folder = encodeURIComponent(folder);
		return this.http
			.get<CourseFilesResponse>(`${apiUrl}/upload/files`, {
				params: {
                    type,
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

	public removeTempFile(filename: string, folder: string) {
		return this.http.post(`${apiUrl}/upload/temp/delete`, {
            filename,
            folder
        })
	}

    public moveFilesToRemote(tempFolder: string | null) {
        return this.http.post(`${apiUrl}/upload/remote`, {
            tempFolder
        })
    }
}
