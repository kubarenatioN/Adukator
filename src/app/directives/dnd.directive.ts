import {
	Directive,
	EventEmitter,
	HostBinding,
	HostListener,
	Output,
} from '@angular/core';

@Directive({
	selector: '[appDnd]',
})
export class DndDirective {
	@HostBinding('class.fileover')
	private isFileOver = false;

	@Output() public filesDropped = new EventEmitter<FileList>();

	constructor() {}

	@HostListener('dragover', ['$event'])
	private onDragOver(e: Event) {
		e.preventDefault();
		// e.stopPropagation();
		this.isFileOver = true;
	}

	@HostListener('dragleave', ['$event'])
	private onDragLeave(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		this.isFileOver = false;
	}

	@HostListener('drop', ['$event'])
	private onDrop(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		this.isFileOver = false;
		const files = (e as InputEvent).dataTransfer?.files;
		if (files && files.length > 0) {
			this.filesDropped.emit(files);
		}
	}
}
