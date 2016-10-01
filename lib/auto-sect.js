'use babel';

import {CompositeDisposable} from 'atom';
import {syntaxFromSource, getTitle} from './util';

export default {
	pkg : 'auto-sect',
	subscriptions : null,

	config : {
		gap: {
			title: 'Edge Gap',
			description: 'Gap between the edges of comments',
			type: 'integer',
			default: 0,
			order: 1
		},
		titleGap: {
			title: 'Title Gap',
			description: 'Space at the edges of the title',
			type: 'integer',
			default: 2,
			order: 2
		},
		caps: {
			title: 'Capitalize Title',
			type: 'boolean',
			default: 'true',
			order: 3
		},
		indent: {
			title: 'Indent Title',
			description: 'When unchecked, title will start from beginning of row',
			type: 'boolean',
			default: 'true',
			order: 4
		}
	},

	defaults : {
		prefix: '//',
		suffix: '',
		titleGap: 2,
		gap: 0,
		caps: true,
		indent: true
	},
	locale : {
		js: {
			prefix: '//',
			suffix: '',
			titleChar: '-'
		},
		html: {
			prefix: '<!--',
			suffix: '-->',
			titleChar: '*'
		},
		css: {
			prefix: '/*',
			suffix: '*/',
			titleChar: '-'
		},
		sass: {
			prefix: '//',
			suffix: '',
			titleChar: '-'
		},
		shell: {
			prefix: '#',
			suffix: '',
			titleChar: '-'
		},
		python: {
			prefix: '#',
			suffix: '',
			titleChar: '-'
		},
		generic: {
			prefix: '//',
			suffix: '',
			titleChar: '-'
		}
	},
	activate(state) {

		// Events subscribed to in atom's system can be easily cleaned up with a
		// CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'auto-sect:title': () => this.title()
		}));
	},

	deactivate() {
		this.subscriptions.dispose();
	},

	getFromConfig(val) {
		if (atom.config.get(`${this.pkg}.${val}`) !== 'undefined')
			return atom.config.get(`${this.pkg}.${val}`);
		return this.defaults[val];
	},

	title() {
		let editor;
		if (editor = atom.workspace.getActiveTextEditor()) {
			// editor exists
			const notificationsManager = atom.notifications;
			const ruler = atom.config.get('editor.preferredLineLength') || 80;
			const row = editor.getCursorBufferPosition().row;
			const titleText = editor.lineTextForBufferRow(row).trim();
			const indentation = editor.indentationForBufferRow(row);
			let caps = this.getFromConfig('caps');
			let gap = this.getFromConfig('gap');
			let titleGap = this.getFromConfig('titleGap');
			let indent = this.getFromConfig('indent');

			// get prefix and suffix according to syntax
			const bufPos = editor.getCursorBufferPosition();
			const source = editor.scopeDescriptorForBufferPosition(bufPos).scopes[0];
			const tabLength = editor.getTabLength() || atom.config.get('editor.tabLength') || 2;
			let syntax = syntaxFromSource(source);
			let {prefix, suffix, titleChar} = this.locale[syntax];
			prefix += gap
				? ''
				: ' ';
			if (suffix.length > 0)
				suffix = ' ' + suffix;

			if (titleText.length >= (ruler - indentation * tabLength - 1) || Math.abs(titleText.length - ruler) <= prefix.length + gap) {
				notificationsManager.addWarning(`Warning in AutoSect:
                  Expected title for line ${row} is '${titleText.slice(0, 15)}...' but preffered
        line length is ${ruler}.`);
				return null;
			}
			if (titleText.length === 0) {
				notificationsManager.addWarning(`Warning in AutoSect:
                Proposed title in line ${row} is empty.`);
				return null;
			}

			// title is valid
			const curSettings = {
				...this.defaults,
				prefix,
				suffix,
				gap,
				indent,
				caps,
				titleGap,
				titleChar
			};
			const replacementLine = getTitle(ruler, titleText, indentation, tabLength, curSettings);
			// replace line
			editor.setTextInBufferRange([
				[
					row, 0
				],
				[
					row, ruler - indentation - 1
				]
			], replacementLine);
			if (indent)
				editor.setIndentationForBufferRow(row, indentation);
			return titleText;

		}
		return null;
	}

};
