import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../constants/urls';

export interface DataRequestPayload {
	url: string;
	method: string;
	headers?: HttpHeaders;
	body?: Record<string, string | number | object | boolean | undefined>;
    params?: HttpParams;
    context?: HttpContext
}

@Injectable({
	providedIn: 'root',
})
export class DataService {
	constructor(private http: HttpClient) {}

	public send<T>(payload: DataRequestPayload): Observable<T> {
		const { method, url, headers, body, params, context } = payload;
		return this.http.request<T>(method, url, {
			body,
			headers,
            params,
            context
		});
	}

    public uploadFile(file: File) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'course-1/module-3/topic-4')
        this.http.post(`${apiUrl}/upload`, formData
            // body: {
            //     file: formData,
            //     folder: 'course-1/module-3/topic-4'
            // }
        ).subscribe(res => {
            console.log(res);
        })
    }
}
