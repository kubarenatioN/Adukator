import { Directive, HostBinding } from '@angular/core';
import { BaseComponent } from '../shared/base.component';

@Directive({
	selector: '[appCenteredContainer]',
})
export class CenteredContainerDirective extends BaseComponent {
	@HostBinding('class.container')
	private isCenteredContainer: boolean = true;
}
