import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '../helpers/date-fns.helper';

@Pipe({
	name: 'date',
})
export class DatePipe implements PipeTransform {
	transform(value: string | Date, format?: string): string {
		return formatDate(value, format);
	}
}
