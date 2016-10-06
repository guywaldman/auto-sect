'use babel';

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
	syntax: 'python',
	regex: /python/
}, {
	syntax: 'haskell',
	regex: /haskell/
}, {
	syntax: 'ruby',
	regex: /ruby/
}, {
	syntax: 'coffeescript',
	regex: /coffee/
}];

export function syntaxFromSource(source) {

	for (key of testKeys) {
		if (key.regex.test(source))
			return key.syntax;
	}
	return 'generic';
}

export function getTitle(settings) {

	let {
		ruler,
		titleText,
		indentation,
		tabLength,
		prefix,
		suffix,
		decor,
		gap,
		titleGap,
		shouldIndent,
		caps,
		level
	} = settings;


	prefix += gap <= 0 ?
		' ' :
		'';
	if (suffix.length > 0)
		suffix = ' ' + suffix;

	// handle errors
	if (titleText.length >= (ruler - indentation * tabLength - gap * 2 - titleGap * 2) ||
		Math.abs(titleText.length - ruler) <= prefix.length + gap) {
		throw ({ msg: `Warning in AutoSect:
							Proposed title is '${titleText.slice(0, 15)}...' but preffered
		line length is ${ruler}.` });
		return null;
	}
	if (titleText.length <= 0) {
		throw ({ msg: `Warning in AutoSect:
						Proposed title is empty.` });
		return null;
	}


	if (!shouldIndent)
		indentation = 0;

	const rowWidth = ruler - indentation * tabLength;
	const titleTotalLen = titleText.length + 2 * titleGap;
	const start = prefix.length + gap;
	const end = suffix.length + gap;

	let repeat = { titleGap: { left: titleGap, right: titleGap }, decor: { left: 0, right: 0 } };

	if (level == 1) {
		// resolve replacement for current line
		const decorRepeatTotal = rowWidth - titleTotalLen - start - end;
		if (decorRepeatTotal < 0)
			throw ({ msg: `Proposed title is too long.` });

		repeat.decor.left = ~~(decorRepeatTotal / 2);
		repeat.decor.right = decorRepeatTotal % 2 === 0 ? repeat.decor.left : repeat.decor.left + 1;
	} else {
		// title is not level 1
		const decorLen = decor.decorLen[level - 1];
		repeat = {...repeat, decor: { left: decorLen, right: 0 }, titleGap: { left: titleGap, right: 0 } };
	}

	let replacementLine = prefix;
	replacementLine += " ".repeat(gap);
	replacementLine += repeat.decor.left ? decor.titleChar.repeat(repeat.decor.left) : "";
	replacementLine += " ".repeat(repeat.titleGap.left);
	replacementLine += caps ? titleText.toUpperCase() : titleText;
	replacementLine += " ".repeat(repeat.titleGap.right);
	replacementLine += repeat.decor.right ? decor.titleChar.repeat(repeat.decor.right) : "";
	replacementLine += " ".repeat(gap);
	replacementLine += suffix;

	return replacementLine;
}

export default {
	syntaxFromSource,
	getTitle
};
