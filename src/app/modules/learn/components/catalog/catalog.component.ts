import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { of } from 'rxjs';

const items = Array(10)
	.fill({
		title: 'Course Name',
		description: 'Course description long and interesting',
	})
	.map((it, i) => ({
		...it,
		id: i + 1,
		views: Math.floor(Math.random() * 100) + 100,
		participants: Math.floor(Math.random() * 30) + 5,
	}));

@Component({
	selector: 'app-courses-catalog',
	templateUrl: './catalog.component.html',
	styleUrls: ['./catalog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent implements OnInit {
	public courses$ = of<any[]>([]);

	constructor() {}

	ngOnInit(): void {
		this.courses$ = of(items);
	}
}
