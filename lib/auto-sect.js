'use babel';

import {
    CompositeDisposable
} from 'atom';

export default {
    subscriptions: null,
    settings: {
        prefix: '// ',
        titleChar: '-',
        titleGap: 2,
        gap: 0,
        caps: true
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
            // editor exits
            // ---------------------  CONSOLE.LOG(EDITOR);  --------------------
            const notificationsManager = atom.notifications;
            const ruler = atom.config.get('editor.preferredLineLength') || 80;
            const row = editor.getCursorBufferPosition().row;
            const titleText = editor.lineTextForBufferRow(row).trim();
            const indentation = editor.indentationForBufferRow(row);
            const tabLength = atom.config.get('editor.tabLength');
            const {
                prefix,
                gap,
                titleGap,
                titleChar,
                caps
            } = this.settings;
            if (titleText.length >= ruler - indentation * tabLength || Math.abs(titleText.length - ruler) <= prefix.length + gap) {
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
            const titleIsEven = titleText.length % 2 === 0;
            const titleTextRadius = ~~(titleText.length / 2);

            const start = prefix.length + gap;
            const rowRadius = ~~((ruler - indentation * tabLength) / 2);
            // -----------------------------------------------------------------
            let replacementLine = prefix;
            replacementLine += " ".repeat(gap);
            replacementLine += titleChar.repeat(rowRadius - titleTextRadius - titleGap - start + 1 + (titleIsEven ? 1 : 0));
            replacementLine += " ".repeat(titleGap);
            replacementLine += caps ? titleText.toUpperCase() : titleText;
            replacementLine += " ".repeat(titleGap);
            replacementLine += titleChar.repeat(rowRadius - titleTextRadius - titleGap - start + 1);

            // // -----------------------------------------------------------------
            editor.setTextInBufferRange([
                [row, indentation * tabLength],
                [row, ruler - indentation - 1]
            ], replacementLine);
            return titleText;
        }
        return null;
    }

};
