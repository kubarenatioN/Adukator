import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DataRequestPayload {
	url: string;
	method: string;
	headers?: HttpHeaders;
	body?: object;
}

const apiUrl = 'http://localhost:8080';

export const DATA_ENDPOINTS = {
	auth: {
        login: `${apiUrl}/auth/login/jwt`,
        user: `${apiUrl}/auth/user`,
    },
	api: {
        course: `${apiUrl}/api/courses`,
    },
    admin: `${apiUrl}/admin`,
};

@Injectable({
	providedIn: 'root',
})
export class DataService {
	constructor(private http: HttpClient) {}

	public send<T>(payload: DataRequestPayload): Observable<T> {
		const { method, url, headers, body } = payload;
		return this.http.request<T>(method, url, {
			body,
			headers,
		});
	}
}
