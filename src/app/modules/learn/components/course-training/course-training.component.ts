import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-course-training',
  templateUrl: './course-training.component.html',
  styleUrls: ['./course-training.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseTrainingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
