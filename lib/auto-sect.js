'use babel';

import { CompositeDisposable } from 'atom';
import { syntaxFromSource, getTitle } from './util';
import config from './config';
import locale from './locale';

export default {
	pkg: 'auto-sect',
	subscriptions: null,

	config,
	locale,

	defaults: {
		level: 1,
		decor: {
			titleChar: '-',
			decorLen: [20, 5]
		},
		prefix: '//',
		suffix: '',
		titleGap: 2,
		gap: 0,
		caps: true,
		shouldIndent: true
	},

	activate(state) {
		// Events subscribed to in atom's system can be easily cleaned up with a
		// CompositeDisposable
		this.subscriptions = new CompositeDisposable();
		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'auto-sect:title': () => this.title(1),
			'auto-sect:title2': () => this.title(2),
			'auto-sect:title3': () => this.title(3),
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

	getCurrentSettings(editor, level) {
		const ruler = atom.config.get('editor.preferredLineLength') || 80;
		const row = editor.getCursorBufferPosition().row;
		const titleText = editor.lineTextForBufferRow(row).trim();
		const caps = this.getFromConfig('caps');
		const gap = this.getFromConfig('gap');
		const titleGap = this.getFromConfig('titleGap');
		const shouldIndent = this.getFromConfig('shouldIndent');
		const indentation = editor.indentationForBufferRow(row);
		const bufPos = editor.getCursorBufferPosition();
		const source = editor.scopeDescriptorForBufferPosition(bufPos).scopes[0];
		const tabLength = editor.getTabLength() || atom.config.get('editor.tabLength') || 2;
		let { prefix, suffix, titleChar } = this.locale[syntaxFromSource(source)];
		let decorLen = this.getFromConfig('decorLen') || this.defaults.decor.decorLen;
		decorLen = Array.prototype.concat.call([0], decorLen);
		const decor = { titleChar, decorLen };
		return {...this.defaults,
			ruler,
			row,
			titleText,
			tabLength,
			caps,
			gap,
			titleGap,
			shouldIndent,
			indentation,
			prefix,
			suffix,
			decor,
			level
		};
	},

	/* title
	 * ---------
	 *
	 */
	title(level) {
		let editor;
		if (editor = atom.workspace.getActiveTextEditor()) {
			// editor exists
			const notificationsManager = atom.notifications;
			// settings for current workspace
			const curSettings = this.getCurrentSettings(editor, level);
			const { ruler, row, titleText, caps, gap, titleGap, shouldIndent, indentation, prefix, suffix, titleChar } = curSettings;

			let replacementLine;
			try {
				replacementLine = getTitle(curSettings);
			} catch (err) {
				notificationsManager.addWarning(String(err.msg));
				return null;
			}

			// replace line
			const bufRange = [];
			bufRange[0] = [row, 0];
			bufRange[1] = [
				row, ruler - indentation - 1
			];
			editor.transact(() => {
				editor.setTextInBufferRange(bufRange, replacementLine);
				editor.setIndentationForBufferRow(row, indentation);
			});


			return titleText;

		}
		return null;
	}

};
