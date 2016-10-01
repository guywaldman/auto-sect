'use babel';

import {
    CompositeDisposable
} from 'atom';
import {
    syntaxFromSource,
    getTitle
} from './util';


export default {
    subscriptions: null,
    settings: {
        prefix: '//',
        suffix: '',
        titleGap: 2,
        gap: 0,
        caps: true
    },
    locale: {
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

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'auto-sect:title': () => this.title()
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
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
            const {
                gap,
                titleGap,
                caps,
            } = this.settings;

            // get prefix and suffix according to syntax
            const bufPos = editor.getCursorBufferPosition();
            const source = editor.scopeDescriptorForBufferPosition(bufPos).scopes[0];
            const tabLength = editor.getTabLength() || atom.config.get('editor.tabLength') || 2;
            let syntax = syntaxFromSource(source);
            let {
                prefix,
                suffix,
                titleChar
            } = this.locale[syntax];
            prefix += ' ';
            if (suffix.length > 0) suffix = ' ' + suffix;

            if (titleText.length >= (ruler - indentation * tabLength - 1) || Math.abs(titleText.length - ruler) <= prefix.length + gap) {
                notificationsManager.addWarning(`Warning in AutoSect:
                  Expected title for line ${row} is '${titleText.slice(0,15)}...' but preffered
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
                ...this.settings,
                prefix,
                suffix,
                gap,
                titleGap,
                titleChar
            };
            const replacementLine = getTitle(ruler, titleText, indentation, tabLength, curSettings);
            // replace line
            editor.setTextInBufferRange([
                [row, 0],
                [row, ruler - indentation - 1]
            ], replacementLine);
            editor.setIndentationForBufferRow(row, indentation);
            return titleText;

        }
        return null;
    }

};
