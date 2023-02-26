import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { TitleStrategy } from '@angular/router';

const textItems = [
    {
        id: 1,
        label: 'Слишком много символов',
    },
    {
        id: 2,
        label: 'Недостаточно символов',
    },
    {
        id: 3,
        label: 'Содержит ошибки',
    },
    {
        id: 4,
        label: 'Нарушает правила содержания',
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
    private textItems = textItems
    
    @Input() public form!: FormGroup
    @Input() public control!: string
    
    public get isActive() {
        return this._isActive
    }
    
    @Input() public type: 'text' | 'category' | 'dates' | 'checkbox' = 'text'

	constructor(private fb: FormBuilder) {
       
    }

	ngOnInit(): void {
        if (!this.form || !this.control) {
            this.control = 'options'
            this.form = this.fb.group({
                [this.control]: new FormControl([])
            })
        }
    }

	public onChange(e: MatSelectChange) {
        
    }

    public onToggle(): void {
        this._isActive = !this._isActive
    }

    public getItems() {
        return this.textItems;
    }
}
