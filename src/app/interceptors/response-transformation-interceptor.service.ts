import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { NetworkRequestKey, REQUEST_TYPE } from '../helpers/network.helper';
import { ConfigService, CourseCategory } from '../services/config.service';
import { Course, TeacherCourses } from '../typings/course.types';

@Injectable({
  providedIn: 'root'
})
export class ResponseTransformationInterceptor implements HttpInterceptor {

  constructor(private configService: ConfigService) { }
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const requestType = req.context.get(REQUEST_TYPE);

        return next.handle(req).pipe(
            switchMap(resp => {
                if (resp instanceof HttpResponse) {
                    return this.transformResponse(requestType, resp);
                }
                return of(resp);
            })
        );
    }

    private transformResponse(reqType: string, resp: HttpResponse<any>): Observable<HttpResponse<any>> {
        const body$ = this.getBodyTransformFn(reqType)(resp.body);
        
        return body$.pipe(
            map(body => {
                return resp.clone({
                    body
                })
            })
        )
    }

    private transformCoursesBody(body: { data?: Course[] }): Observable<any> {
        return this.configService.loadCourseCategories().pipe(
            map(categories => {
                let { data } = body;
                if (data) {
                    data = this.processCoursesData(data, categories);
                }
                body.data = data
                return body;
            })
        )
    }

    private transformTeacherCoursesData(body: { data?: TeacherCourses }): Observable<any> {
        return this.configService.loadCourseCategories().pipe(
            map(categories => {
                let { data } = body;
                if (data?.published) {
                    data.published = this.processCoursesData(data.published, categories);
                }
                if (data?.review) {
                    data.review = this.processCoursesData(data.review, categories);
                }
                body.data = data

                return body;
            })
        )
    }

    private getBodyTransformFn(reqType: string): (body: any) => Observable<any> {
        if (
            reqType === NetworkRequestKey.GetReviewCourseHistory
        ) {
            return this.transformCoursesBody.bind(this);
        }

        if (reqType === NetworkRequestKey.TeacherCourses) {
            return this.transformTeacherCoursesData.bind(this);
        }

        return (body: any): Observable<any> => of(body);
    }

    private processCoursesData(data: any[], categories: CourseCategory[]): any[] {
        if (!Array.isArray(data)) {
            data = [data]
        }
        data = data.map(course => {
            course.categoryLabel = categories.find(category => category.key === course.category)?.name
            return course
        });
        return data
    }
}
