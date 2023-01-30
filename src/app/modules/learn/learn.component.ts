import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearnComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
