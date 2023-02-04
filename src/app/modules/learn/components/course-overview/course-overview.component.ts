import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseOverviewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
