import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-course-builder',
  templateUrl: './course-builder.component.html',
  styleUrls: ['./course-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseBuilderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
