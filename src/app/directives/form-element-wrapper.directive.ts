import {
	ComponentRef,
	Directive,
	Input,
	OnInit,
	TemplateRef,
	ViewContainerRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormElementReviewWrapperComponent, ReviewType } from '../components/form-element-review-wrapper/form-element-review-wrapper.component';
import { WrapperType } from '../typings/course.types';

@Directive({
	selector: '[appFormElWrapper]',
})
export class FormElementWrapperDirective implements OnInit {
	private wrapperContainer!: ComponentRef<FormElementReviewWrapperComponent>;
	private form!: FormGroup;
	private control!: string;
	private type!: WrapperType;
	private reviewType!: ReviewType;
	private isVertical: boolean = false;

	@Input() public set appFormElWrapper(value: FormGroup) {
		this.form = value;
		if (this.wrapperContainer) {
			this.wrapperContainer.instance.form = this.form;
		}
	}

	@Input() public set appFormElWrapperType(value: WrapperType) {
		this.type = value;
	}

	@Input() public set appFormElWrapperControl(value: string) {
		this.control = value;
	}

	@Input() public set appFormElWrapperReviewType(value: ReviewType) {
		this.reviewType = value;
	}

	@Input() public set appFormElWrapperIsVertical(value: boolean) {
		this.isVertical = value;
	}

	constructor(
		private templateRef: TemplateRef<any>,
		private viewContainerRef: ViewContainerRef
	) {}

	public ngOnInit(): void {
		this.wrapperContainer = this.viewContainerRef.createComponent(
			FormElementReviewWrapperComponent
		);
		// Order matters
		this.wrapperContainer.instance.isVertical = this.isVertical;
		this.wrapperContainer.instance.control = this.control;
		this.wrapperContainer.instance.reviewType = this.reviewType;
		this.wrapperContainer.instance.type = this.type;
		this.wrapperContainer.instance.form = this.form;
		this.wrapperContainer.instance.content = this.templateRef;
	}
}
