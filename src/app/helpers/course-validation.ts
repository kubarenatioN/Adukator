import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from "@angular/forms";

export function moduleTopicsCountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const formArray = control as FormArray;
        const hasAtLeastOneTopic = formArray.value.length > 0
        return hasAtLeastOneTopic ? null : { topicsCount: 0 };
    }
}