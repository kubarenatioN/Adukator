import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-module-topic',
	templateUrl: './module-topic.component.html',
	styleUrls: ['./module-topic.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleTopicComponent implements OnInit {
	@Input() public order: number;
	@Input() public form!: FormGroup;

    @Output() public saveTopic = new EventEmitter<FormGroup>();
    @Output() public removeTopic = new EventEmitter<void>();

	constructor(private fb: FormBuilder) {
        this.order = 0;
    }

	ngOnInit(): void {
        if (!this.form) {
            this.form = this.fb.group({
                title: ['', Validators.required],
                description: [''],
            })
        }

        this.form.valueChanges.subscribe(value => {
            
        })
    }

    public onRemove(): void {
        this.removeTopic.emit();
    }
}
