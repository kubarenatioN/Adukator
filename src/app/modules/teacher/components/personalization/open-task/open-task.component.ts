import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-open-task',
  templateUrl: './open-task.component.html',
  styleUrls: ['./open-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenTaskComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
