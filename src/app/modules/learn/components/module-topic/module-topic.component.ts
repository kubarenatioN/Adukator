import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type SectionType = 'theory' | 'practice' | 'test'

@Component({
	selector: 'app-module-topic',
	templateUrl: './module-topic.component.html',
	styleUrls: ['./module-topic.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleTopicComponent implements OnInit {
	@Input() public order!: number;
	@Input() public form!: FormGroup;

    // form for editor comments
	@Input() public editorForm: FormGroup | null = null;

    @Output() public saveTopic = new EventEmitter<FormGroup>();
    @Output() public removeTopic = new EventEmitter<void>();

    public sections = {
        practice: false,
        theory: false,
        test: false,
    }

	constructor(private fb: FormBuilder) {

    }

	ngOnInit(): void {
        if (!this.form) {
            this.form = this.fb.group({
                title: ['', Validators.required],
                description: [''],
            })
        }

        this.form.valueChanges.subscribe(value => {
            console.log('111 change topic', value);
        })
    }

    public onRemove(): void {
        if (this.order === 0) {
            return;
        }
        this.removeTopic.emit();
    }

    public onAddSection(sectionType: SectionType) {
        this.sections[sectionType] = true
    }

    public onRemoveSection(sectionType: SectionType) {
        this.sections[sectionType] = false
    }
}
