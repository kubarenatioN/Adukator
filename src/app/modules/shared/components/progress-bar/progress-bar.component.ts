import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent implements OnInit {
  private _progress = 0;

  public get progress() {
    return this._progress / this.max * 100
  }

  @Input() public set progress(value: number) {
    this._progress = value
  }
  
  @Input() public max: number = 100;

  constructor() { }

  ngOnInit(): void {
  }

}
