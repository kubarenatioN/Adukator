import {
	HttpClient,
	HttpContext,
	HttpHeaders,
	HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DataRequestPayload {
	url: string;
	method: string;
	headers?: HttpHeaders;
	body?: Record<string, string | number | object | boolean | undefined>;
	params?: HttpParams;
	context?: HttpContext;
}

@Injectable({
	providedIn: 'root',
})
export class DataService {
	constructor(private httpClient: HttpClient) {}

	public get http() {
		return this.httpClient;
	}

	public send<T>(payload: DataRequestPayload): Observable<T> {
		const { method, url, headers, body, params, context } = payload;
		return this.httpClient.request<T>(method, url, {
			body,
			headers,
			params,
			context,
		});
	}
}
