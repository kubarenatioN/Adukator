import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, map, Observable } from 'rxjs';
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
]

type ReviewType = 'text' | 'category' | 'dates' | 'checkbox';

@Component({
	selector: 'app-form-element-review-wrapper',
	templateUrl: './form-element-review-wrapper.component.html',
	styleUrls: ['./form-element-review-wrapper.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormElementReviewWrapperComponent implements OnInit {
    private _form!: FormGroup;
    private textItems = textItems
    private commentsStore$ = new BehaviorSubject<CourseReviewControlComment[]>([]);
    private reviewItemsStore$ = new BehaviorSubject<CourseReviewControlComment[]>(textItems);
    private isReviewActiveStore$ = new BehaviorSubject<boolean>(false);
    private isEditDoneStore$ = new BehaviorSubject<boolean>(false);
    
    @Input() public content!: TemplateRef<any>;
    @Input() public set form(value: FormGroup) {
        this._form = value.controls['comments'] as FormGroup;
        if (this.type === 'review') {
            this.checkReviewComments();
        } else {
            console.log(this._form.value);
            this.commentsStore$.next(this.getComments());
        }
    }
    @Input() public control!: string
    @Input() public type: WrapperType = 'review';
    @Input() public reviewType: ReviewType = 'text'

    public reviewItems$: Observable<CourseReviewControlComment[]>;
    public comments$: Observable<CourseReviewControlComment[]>;
    public isReviewActive$: Observable<boolean>;
    public isEditDone$: Observable<boolean>;
    public hasComments$: Observable<boolean>;

    public get form(): FormGroup {
        return this._form;
    }

	constructor(private cd: ChangeDetectorRef) {
        this.reviewItems$ = this.reviewItemsStore$.asObservable();
        this.isReviewActive$ = this.isReviewActiveStore$.asObservable();
        this.isEditDone$ = this.isEditDoneStore$.asObservable();
        this.comments$ = this.commentsStore$.asObservable();
        this.hasComments$ = this.comments$.pipe(map(comments => comments.length > 0));
    }

	ngOnInit(): void {

    }

	public onChange(e: MatSelectChange) {
        
    }

    public onToggle(type: WrapperType): void {
        if (type === 'review') {
            this.isReviewActiveStore$.next(!this.isReviewActiveStore$.value);
        }
        else if (type === 'edit') {
            this.isEditDoneStore$.next(!this.isEditDoneStore$.value);
        }
    }

    public getCommentsLabel(comments: CourseReviewControlComment[]) {
        return comments
    }

    public getItems() {
        return this.textItems;
    }

    private getComments(): CourseReviewControlComment[] {
        if (this.form === null) {
            return [];
        }
        
        let value = this.form.value[this.control];
        if (value === null) {
            return []
        }

        return Array.isArray(value) ? value : [value]
    }

    private checkReviewComments() {
        const comments = this._form.value[this.control];

        const isReviewActive = comments !== null && comments.length > 0;
        this.isReviewActiveStore$.next(isReviewActive)
        this.reviewItemsStore$.next(this.reviewItemsStore$.value);
        // console.log('comments', comments, isReviewActive);
    }
}
