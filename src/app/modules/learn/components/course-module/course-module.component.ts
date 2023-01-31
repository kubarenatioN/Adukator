import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-course-module',
	templateUrl: './course-module.component.html',
	styleUrls: ['./course-module.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseModuleComponent implements OnInit {
	@Input() public form!: FormGroup;
	@Input() public set index(value: number) {
        if (this.form && this.form.controls['title'].value === '') {
            this.form.controls['title'].setValue(`Модуль ${value + 1}`)
        }
    };
    
    @Output() public changeTitle = new EventEmitter<string>();
    
    public get title(): string {
        return this.form && this.form.get('title')?.value || '';
    }

    constructor() {}

	ngOnInit(): void {

    }

}
