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

export function getTitle(ruler, titleText, indentation, tabLength, settings) {

    const {
        prefix,
        suffix,
        titleChar,
        gap,
        titleGap,
        caps
    } = settings;

    const titleTextLength = titleText.length;
    const rowWidth = ruler - indentation * tabLength;
    const start = prefix.length + gap;
    const end = suffix.length + gap;
    // resolve replacement for current line
    const titleCharRepeatTotal = rowWidth - titleTextLength - 2 * titleGap - start - end;
    let titleCharRepeatLeft, titleCharRepeatRight;
    if (titleCharRepeatTotal % 2 === 0) {
        // title length is even
        titleCharRepeatLeft = titleCharRepeatTotal / 2;
        titleCharRepeatRight = titleCharRepeatLeft;
    } else {
        titleCharRepeatLeft = ~~(titleCharRepeatTotal / 2);
        titleCharRepeatRight = titleCharRepeatLeft + 1;
    }

    let replacementLine = prefix;
    replacementLine += " ".repeat(gap);
    replacementLine += titleChar.repeat(titleCharRepeatLeft);
    replacementLine += " ".repeat(titleGap);
    replacementLine += caps ? titleText.toUpperCase() : titleText;
    replacementLine += " ".repeat(titleGap);
    replacementLine += titleChar.repeat(titleCharRepeatRight);
    replacementLine += " ".repeat(gap);
    replacementLine += suffix;

    return replacementLine;
}

export default {
    syntaxFromSource,
    getTitle
};
