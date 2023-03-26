import { ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
	selector: 'app-chips-control',
	templateUrl: './chips-control.component.html',
	styleUrls: ['./chips-control.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsControlComponent {
	@Input() form!: FormGroup
	@Input() control!: string
	@Input() title!: string
	@Input() public addOnBlur = true;
	readonly separatorKeysCodes = [ENTER] as const;

	private _items: any[] = [];
	public get items(): any[]{
        return this._items;
    }
	public set items(value: any[]) {
        this._items = value;
        this.form.patchValue({
            [this.control]: value
        })
    }

	public add(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();
		if (value) {
			this.items = [...this.items, value];
		}
		event.chipInput!.clear();
	}

	public remove(value: string): void {
        this.items = this.items.filter(item => item !== value);
	}
}
