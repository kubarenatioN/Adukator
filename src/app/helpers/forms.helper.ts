import { FormArray, FormGroup } from '@angular/forms';
import { addDays, addYears } from 'date-fns/esm';
import { getNextYearTime, getTodayTime } from './date-fns.helper';

const MAX_DATE = getNextYearTime();

function getFormAllTopics(form: FormGroup) {
	const allTopics: FormGroup[] = [];

	(form.get('modules') as FormArray).controls.forEach((moduleForm) => {
		const moduleTopicForms = (moduleForm.get('topics') as FormArray)
			.controls as FormGroup[];
		allTopics.push(...moduleTopicForms);
	});

	return allTopics;
}

export function getTopicMinDate(
	courseForm: FormGroup,
	topicForm: FormGroup
): Date | null {
	const allTopics = getFormAllTopics(courseForm);

	const currentFormIndex = allTopics.indexOf(topicForm);
	if (currentFormIndex === 0) {
		return getTodayTime();
	}

	const prevForms = allTopics.slice(0, currentFormIndex);
	const prevClosestMaxEndDate =
		prevForms.length > 0
			? prevForms.reduceRight((max, form) => {
					if (form.value.endDate === null) {
						return max;
					}
					const formEndDate = new Date(form.value.endDate);
					return formEndDate > max ? formEndDate : max;
			  }, getTodayTime())
			: getTodayTime();

	return addDays(prevClosestMaxEndDate, 1);
}

export function getTopicMaxDate(
	courseForm: FormGroup,
	topicForm: FormGroup
): Date | null {
	const allTopics = getFormAllTopics(courseForm);

	const currentFormIndex = allTopics.indexOf(topicForm);
	const totalFormsCount = allTopics.length;
	if (currentFormIndex === totalFormsCount - 1) {
		return MAX_DATE;
	}

	const nextForms = allTopics.slice(currentFormIndex + 1);
	const nextClosestMinStartDate =
		nextForms.length > 0
			? nextForms.reduceRight((min, form) => {
					if (form.value.startDate === null) {
						return min;
					}
					const formStartDate = new Date(form.value.startDate);
					return formStartDate < min ? formStartDate : min;
			  }, MAX_DATE)
			: getTodayTime();

	return addDays(nextClosestMinStartDate, -1);
}
