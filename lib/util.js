'use babel';

const python = {
    syntax: 'python',
    regex: /python/
};

const testKeys = [{
    syntax: 'js',
    regex: /jsx?/
}, {
    syntax: 'sass',
    regex: /(?:sass|scss)/
}, {
    syntax: 'html',
    regex: /x?html?/
}, {
    syntax: 'css',
    regex: /css/
}, {
    syntax: 'shell',
    regex: /bash|shell/
}, {
    ...python
}];

export function syntaxFromSource(source) {

    for (key of testKeys) {
        if (key.regex.test(source))
            return key.syntax;
    }
    return 'generic';
}

export function tabLengthFromSource(editor, source) {
    if (python.regex.test(source)) return 4;
    return editor.tabLength ? editor.tabLength : atom.config.get('editor.tabLength');
}

export default {
    syntaxFromSource,
    tabLengthFromSource
};
