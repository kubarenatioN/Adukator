import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import { CourseBundle, CourseBundleCreatePayload } from 'src/app/typings/course.types';

@Injectable()
export class BundleService {
  constructor(private dataService: DataService) {

  }

  public getAuthorBundles(authorId: string) {
    return this.dataService.http.get<{ data: CourseBundle[] }>(`${DATA_ENDPOINTS.api.courses}/bundle`, {
      params: { reqId: 'GetBundles', authorId, }
    }).pipe(map(res => res.data))
  }

  public getSingleBundle(id: string) {
    return this.dataService.http.get<{ data: CourseBundle }>(`${DATA_ENDPOINTS.api.courses}/bundle/${id}`, {
      params: { reqId: 'GetCourseBundle' }
    }).pipe(map(res => res.data))
  }

  public getBundles(ids: string[]) {
    const key = NetworkRequestKey.GetCoursesBundles
    const payload = NetworkHelper.createRequestPayload(key, {
      body: { ids },
      params: { reqId: key }
    })
    return this.dataService.send<{ data: CourseBundle[] }>(payload).pipe(map(res => res.data))
  }

  public createCoursesBundle(bundle: CourseBundleCreatePayload) {
    const key = NetworkRequestKey.CreateCoursesBundle
    const payload = NetworkHelper.createRequestPayload(key, {
      body: { bundle }
    })

    return this.dataService.send(payload)
  }
}
