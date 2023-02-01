import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-module-topic',
	templateUrl: './module-topic.component.html',
	styleUrls: ['./module-topic.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleTopicComponent implements OnInit {
	@Input() public form!: FormGroup;

    @Output() public saveTopic = new EventEmitter<FormGroup>();

	constructor(private fb: FormBuilder) {
        
    }

	ngOnInit(): void {
        if (!this.form) {
            this.form = this.fb.group({
                title: ['', Validators.required],
                description: [''],
            })
        }
    }

    public onSaveTopic(): void {
        const { valid: isValid } = this.form;
        if (isValid) {
            this.saveTopic.emit(this.form);
        }
    }
}
