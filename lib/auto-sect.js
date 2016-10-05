'use babel';

import {CompositeDisposable} from 'atom';
import {syntaxFromSource, getTitle} from './util';
import config from './config';
import locale from './locale';

export default {
	pkg : 'auto-sect',
	subscriptions : null,

	config,
	locale,

	defaults : {
		prefix: '//',
		suffix: '',
		titleGap: 2,
		gap: 0,
		caps: true,
		indent: true
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
			let replacementLine;
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
			try {
				replacementLine = getTitle(ruler, titleText, indentation, tabLength, curSettings);
			} catch (err) {
				notificationsManager.addWarning(err);
				return null;
			}

			// replace line
			const bufRange = [];
			bufRange[0] = [row, 0];
			bufRange[1] = [
				row, ruler - indentation - 1
			];
			editor.setTextInBufferRange(bufRange, replacementLine);
			if (indent)
				editor.setIndentationForBufferRow(row, indentation);
			return titleText;

		}
		return null;
	}

};
