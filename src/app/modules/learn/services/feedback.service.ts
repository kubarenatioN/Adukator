import { Injectable } from '@angular/core';
import { NetworkHelper, NetworkRequestKey } from 'src/app/helpers/network.helper';
import { DataService } from 'src/app/services/data.service';
import { CourseFeedback } from 'src/app/typings/course.types';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private dataService: DataService) { }

  public postCourseFeedback(body: {
    text: string,
    rating?: number,
    authorId: string,
    courseId: string,
    trainingId?: string
  }) {
    const key = NetworkRequestKey.Feedback
    const payload = NetworkHelper.createRequestPayload(key, {
      body,
      params: { reqId: key },
      method: 'POST',
    })

    return this.dataService.send<{ created: CourseFeedback }>(payload)
  }

  public getCourseFeedbacks(courseId: string, trainingId?: string) {
    const key = NetworkRequestKey.Feedback
    const payload = NetworkHelper.createRequestPayload(key, {
      params: { reqId: key, courseId },
      method: 'GET'
    })
    if (trainingId) {
      payload.params = payload.params?.appendAll({ trainingId })
    }
    return this.dataService.send<{ data: CourseFeedback[] }>(payload)
  }
}
