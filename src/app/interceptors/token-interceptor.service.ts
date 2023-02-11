import {
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NetworkHelper } from '../helpers/network.helper';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
	constructor(private userService: UserService) {}
	intercept(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
        const token = this.userService.token;
        if (token) {
            const clone = req.clone({
                setHeaders: {
                    [NetworkHelper.authorizationHeader]: token,
                    'X-Test': '123'
                }
            });
            return next.handle(clone);
        }
        return next.handle(req);
	}
}
