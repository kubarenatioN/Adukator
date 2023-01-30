import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCourseComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
