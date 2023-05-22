export const CoursesSelectFields = {
	Dashboard: ['uuid', 'title', 'competencies', 'authorId', 'masterId', 'topics'],
	Short: ['uuid', 'title', 'competencies', 'authorId', 'masterId'],
	Modules: ['uuid', 'title', 'modules', 'authorId', 'topics'],
	Full: [],
	ReviewHistory: [
		'uuid',
		'title',
		'createdAt',
		'masterId',
		'status',
		'authorId',
		'masterId',
	],
};
