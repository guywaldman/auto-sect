'use babel';

export default {
	gap: {
		title: 'Edge Gap',
		description: 'Gap between the edges of comments',
		type: 'integer',
		minimum: 0,
		default: 0,
		order: 1
	},
	titleGap: {
		title: 'Title Gap',
		description: 'Space at the edges of the title',
		type: 'integer',
		minimum: 0,
		default: 2,
		order: 2
	},
	caps: {
		title: 'Capitalize Title',
		type: 'boolean',
		default: 'true',
		order: 3
	},
	shouldIndent: {
		title: 'Indent Title',
		description: 'When unchecked, title will start from beginning of row',
		type: 'boolean',
		default: 'true',
		order: 4
	}

};
