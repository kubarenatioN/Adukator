import {
	Component,
	HostBinding,
	Input,
	OnInit,
	TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CourseReviewControlComment } from 'src/app/typings/course-review.types';
import { WrapperType } from 'src/app/typings/course.types';

const textItems: CourseReviewControlComment[] = [
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
];

const fileItems: CourseReviewControlComment[] = [
	{
		id: 1,
		label: 'Файлы не несут обучающий характер',
	},
	{
		id: 2,
		label: 'Плохое качество файлов',
	},
	{
		id: 3,
		label: 'Избыточное количество файлов',
	},
];

const categoryItems: CourseReviewControlComment[] = [
	{
		id: 1,
		label: 'Категория не соответствует содержанию',
	},
];

const imageItems: CourseReviewControlComment[] = [
	{
		id: 1,
		label: 'Изображение не соответствует содержанию',
	},
	{
		id: 2,
		label: 'Изображение не образовательного характера',
	},
];

const competenciesItems: CourseReviewControlComment[] = [
	{
		id: 4,
		label: 'Недостаточно компетенций',
	},
	{
		id: 1,
		label: 'Слишком много компетенций',
	},
	{
		id: 2,
		label: 'Несочетающиеся компетенции',
	},
	{
		id: 3,
		label: 'Неподходящие к категории компетенции',
	},
];

export type ReviewType = 'text' | 'category' | 'file' | 'dates' | 'checkbox' | 'image' | 'competencies';

@Component({
	selector: 'app-form-element-review-wrapper',
	templateUrl: './form-element-review-wrapper.component.html',
	styleUrls: ['./form-element-review-wrapper.component.scss'],
})
export class FormElementReviewWrapperComponent implements OnInit {
	@HostBinding('class') classes = '';
	
	private _form!: FormGroup;
	
	public comments: CourseReviewControlComment[] = []

	public reviewItems: CourseReviewControlComment[] = []
	
	@Input() public content!: TemplateRef<any>;
	@Input() public set form(value: FormGroup) {
		const form = value.controls['comments'] as FormGroup;
		this._form = form		
		this.comments = this.getComments(this._form)
		this.hasComments = this.comments.length > 0

		if (this.type === 'review') {
			this.isReviewActive = this.hasComments
			this.reviewItems = this.getReviewItems(this.reviewType)
		}
	}
	@Input() public control!: string;
	@Input() public type: WrapperType = 'review';
	@Input() public reviewType: ReviewType = 'text';
	@Input() public isVertical: boolean = false;

	public isReviewActive: boolean = false;
	public isEditDone: boolean = false;
	public hasComments: boolean = false;

	public get form(): FormGroup {
		return this._form;
	}

	constructor() {
	}

	ngOnInit(): void {
		this.classes = this.classes + ` ${this.isVertical ? 'vertical' : ''}`;
	}

	public onToggle(type: WrapperType): void {
		if (type === 'review') {
			this.isReviewActive = !this.isReviewActive;
		} else if (type === 'edit') {
			this.isEditDone = !this.isEditDone;
		}
	}

	public compareCommentOptions(o1: CourseReviewControlComment, o2: CourseReviewControlComment) {
	return o1 && o2 && o1.id == o2.id;
	}

	public getReviewItems(type: ReviewType) {
		switch (type) {
			case 'text':
				return [...textItems]
		
			case 'file':
				return [...fileItems]
		
			case 'category':
				return [...categoryItems]
		
			case 'image':
				return [...imageItems]
		
			case 'competencies':
				return [...competenciesItems]
		
			default:
				return [...textItems]
		}
	}

	private getComments(form: FormGroup): CourseReviewControlComment[] {
		if (form === null) {
			return [];
		}

		let value = form.value[this.control];
		if (value === null) {
			return [];
		}

		return Array.isArray(value) ? value : [value];
	}
}
