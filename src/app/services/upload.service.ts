import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { apiUrl } from '../constants/urls';
import { UserFile } from '../typings/files.types';
import { CloudinaryFilesResponse, CourseFilesResponse } from '../typings/response.types';

export type UploadPathSegment = 'tasks' | 'topics' | 'training' 

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
		if (type === 'remote') {
            return this.getFilesFromCloud(folder)
        }
        return this.getFilesFromLocal(folder)
	}

	public removeTempFile(filename: string, folder: string) {
		return this.http.post(`${apiUrl}/upload/temp/delete`, {
            filename,
            folder
        })
	}

    public moveFilesToRemote(root: string | null) {
        return this.http.post(`${apiUrl}/upload/remote`, {
            rootFolder: root
        })
    }

    public getFilesFolder(...segments: string[]) {
        return segments.join('/')
    }

    private getFilesFromCloud(folder: string): Observable<CourseFilesResponse> {
        return this.http.get<CloudinaryFilesResponse>(`${apiUrl}/upload/files`, {
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
                            url: file.url
                        };
                    });
                    
                    return {
                        files,
                        total: res.total_count
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
            })
    }
}
