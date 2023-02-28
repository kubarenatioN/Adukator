import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { TitleStrategy } from '@angular/router';

const textItems: CommentItem[] = [
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

interface CommentItem {
    id: number,
    label: string
}
type WrapperType = 'review' | 'edit';
type ReviewType = 'text' | 'category' | 'dates' | 'checkbox';

@Component({
	selector: 'app-form-element-review-wrapper',
	templateUrl: './form-element-review-wrapper.component.html',
	styleUrls: ['./form-element-review-wrapper.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormElementReviewWrapperComponent implements OnInit {
    private _isReviewActive = false;
    private _isEditDone = false;
    private textItems = textItems
    
    @Input() public type!: WrapperType;
    @Input() public form!: FormGroup
    @Input() public control!: string
    @Input() public reviewType: ReviewType = 'text'
    
    public get isReviewActive(): boolean {
        return this._isReviewActive
    }
    
    public get isEditDone(): boolean {
        return this._isEditDone
    }
    
    public get hasComments(): boolean {
        return this.comments.length > 0
    }

    public get comments(): CommentItem[] {
        let value = this.form.controls[this.control].value
        if (value === null) {
            return []
        }

        return Array.isArray(value) ? value : [value]
    }

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

    public onToggle(type: WrapperType): void {
        if (type === 'review') {
            this._isReviewActive = !this._isReviewActive
        }
        else if (type === 'edit') {
            this._isEditDone = !this._isEditDone
        }
    }

    public getCommentsLabel(comments: CommentItem[]) {
        return comments
    }

    public getItems() {
        return this.textItems;
    }
}
