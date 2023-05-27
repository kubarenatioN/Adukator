import {
	AbstractControl,
	FormArray,
	ValidationErrors,
	ValidatorFn,
} from '@angular/forms';

export function moduleTopicsCountValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const formArray = control as FormArray;
		const hasAtLeastOneTopic = formArray.value.length > 0;
		return hasAtLeastOneTopic ? null : { topicsCount: 0 };
	};
}

export class ChipsValidator {

	public static required(control: AbstractControl): ValidatorFn {
		return (control?: AbstractControl): ValidationErrors | null => {
			return !control?.value
				? { required: true }
				: null;
		}
	};

	public static minLength(min: number): ValidatorFn {
		return (control?: AbstractControl): ValidationErrors | null => {			
			return control && control.value.length < min
				? { minComp: true }
				: null;
		}
	};
}
