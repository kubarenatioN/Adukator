import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

const items = [
    {
        id: 1,
        label: 'Слишком много символов',
        selected: false,
    },
    {
        id: 2,
        label: 'Недостаточно символов',
        selected: false,
    },
    {
        id: 3,
        label: 'Содержит ошибки',
        selected: true,
    },
    {
        id: 4,
        label: 'Нарушает правила содержания',
        selected: false,
    },
]

@Component({
	selector: 'app-form-element-review-wrapper',
	templateUrl: './form-element-review-wrapper.component.html',
	styleUrls: ['./form-element-review-wrapper.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormElementReviewWrapperComponent implements OnInit {
    private _isActive = false;
    
    public form: FormGroup
    public items = items

    public get isActive() {
        return this._isActive
    }
    
    @Input() public type: string = 'input'

	constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            options: new FormControl(items)
        })
    }

	ngOnInit(): void {}

	public onChange(e: MatSelectChange) {
        
    }

    public onToggle(): void {
        this._isActive = !this._isActive
    }
}
