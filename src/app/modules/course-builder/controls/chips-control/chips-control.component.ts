import { ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, debounceTime, map, startWith } from 'rxjs';

export type ChipItem = { id: string; label: string };

@Component({
	selector: 'app-chips-control',
	templateUrl: './chips-control.component.html',
	styleUrls: ['./chips-control.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsControlComponent implements OnInit {
	private _items: ChipItem[] | null = null
	
	@Input() public form!: FormGroup;
	@Input() public control!: string;
	@Input() public title!: string;
	@Input() public set items(value: ChipItem[] | null) {
		this._items = value;
		this.pickedItems = []
	};
	@Input() public set picked(value: ChipItem[] | null | undefined) {
		if (value) {
			this.pickedItems = value;
		}
	};
	@Input() public addOnBlur = true;
	readonly separatorKeysCodes = [ENTER] as const;
	public filteredItems$!: Observable<ChipItem[]>
	public pickedItems: ChipItem[] = [];
	public query = new FormControl<string | null>(null)

	@ViewChild('input')
	public input!: ElementRef<HTMLInputElement>;

	public ngOnInit(): void {
		this.filteredItems$ = this.query.valueChanges
		.pipe(
			startWith(''),
			debounceTime(300),
			map(query => query ? this.filterItems(query) : (this.items ?? []))
		)
	}

	public add(event: MatChipInputEvent): void {		
		const label = event.value.trim();
		const value = this._items
			?.filter(it => this.pickedItems.findIndex(picked => picked.id === it.id) === -1)
			.find(it => it.label === label);
		if (value) {
			this.pickedItems.push(value);
			this.form.patchValue({
				[this.control]: this.pickedItems,
			});
		}
		event.chipInput!.clear();
		this.query.setValue(null)
	}

	public remove(id: string): void {		
		this.pickedItems = this.pickedItems.filter((item) => item.id !== id);
		this.form.patchValue({
			[this.control]: this.pickedItems,
		});
	}

	public selected(event: MatAutocompleteSelectedEvent): void {
		const id = event.option.value;
		const item = this._items?.find(it => it.id === id)
		if (item && !this.pickedItems.includes(item)) {
			this.pickedItems.push(item);
			this.form.patchValue({
				[this.control]: this.pickedItems,
			});
		}
		
		this.input.nativeElement.value = '';
		this.query.setValue(null);
	}

	private filterItems(query: string) {
		query = query.toLowerCase()
		return this._items 
			? this._items.filter(it => {
				const isPicked = this.pickedItems.findIndex(picked => picked.id === it.id) > -1
				const isInQuery = it.label.toLowerCase().includes(query)
				return !isPicked && isInQuery
			})
			: []
	}
}
