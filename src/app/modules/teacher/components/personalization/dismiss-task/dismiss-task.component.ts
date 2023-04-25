import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dismiss-task',
  templateUrl: './dismiss-task.component.html',
  styleUrls: ['./dismiss-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DismissTaskComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
