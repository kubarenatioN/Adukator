import { Training } from '../typings/training.types';
import { User } from '../typings/user.types';

export const isTraining = (
	training: string | Training
): training is Training => {
	return typeof training === 'string';
};

export const isStudent = (student: string | User): student is User => {
	return typeof student === 'string';
};

export const studentId = (student: string | User): string => {
	return isStudent(student) ? student._id : student;
};

export const trainingId = (training: string | Training): string => {
	return isTraining(training) ? training._id : training;
};
