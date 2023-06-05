import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student-progress-container',
  templateUrl: './student-progress-container.component.html',
  styleUrls: ['./student-progress-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentProgressContainerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
