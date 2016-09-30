'use babel';

export default function syntaxFromSource(source) {
    if (/jsx?/.test(source))
        return 'js';
    if (/(?:sass|scss)/.test(source))
        return 'sass';
    if (/x?html?/.test(source))
        return 'html';
    if (/css/.test(source))
        return 'css';
    return 'generic';
}
