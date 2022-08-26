export default /** @type {import("../types").LanguageProto} */ ({
	id: 'regex',
	grammar() {
		const specialEscape = {
			pattern: /\\[\\(){}[\]^$+*?|.]/,
			alias: 'escape'
		};
		const escape = /\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/;
		const charSet = {
			pattern: /\.|\\[wsd]|\\p\{[^{}]+\}/i,
			alias: 'class-name'
		};
		const charSetWithoutDot = {
			pattern: /\\[wsd]|\\p\{[^{}]+\}/i,
			alias: 'class-name'
		};

		const rangeChar = '(?:[^\\\\-]|' + escape.source + ')';
		const range = RegExp(rangeChar + '-' + rangeChar);

		// the name of a capturing group
		const groupName = {
			pattern: /(<|')[^<>']+(?=[>']$)/,
			lookbehind: true,
			alias: 'variable'
		};

		return {
			'char-class': {
				pattern: /((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/,
				lookbehind: true,
				inside: {
					'char-class-negation': {
						pattern: /(^\[)\^/,
						lookbehind: true,
						alias: 'operator'
					},
					'char-class-punctuation': {
						pattern: /^\[|\]$/,
						alias: 'punctuation'
					},
					'range': {
						pattern: range,
						inside: {
							'escape': escape,
							'range-punctuation': {
								pattern: /-/,
								alias: 'operator'
							}
						}
					},
					'special-escape': specialEscape,
					'char-set': charSetWithoutDot,
					'escape': escape
				}
			},
			'special-escape': specialEscape,
			'char-set': charSet,
			'backreference': [
				{
					// a backreference which is not an octal escape
					pattern: /\\(?![123][0-7]{2})[1-9]/,
					alias: 'keyword'
				},
				{
					pattern: /\\k<[^<>']+>/,
					alias: 'keyword',
					inside: {
						'group-name': groupName
					}
				}
			],
			'anchor': {
				pattern: /[$^]|\\[ABbGZz]/,
				alias: 'function'
			},
			'escape': escape,
			'group': [
				{
					// https://docs.oracle.com/javase/10/docs/api/java/util/regex/Pattern.html
					// https://docs.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference?view=netframework-4.7.2#grouping-constructs

					// (), (?<name>), (?'name'), (?>), (?:), (?=), (?!), (?<=), (?<!), (?is-m), (?i-m:)
					pattern: /\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/,
					alias: 'punctuation',
					inside: {
						'group-name': groupName
					}
				},
				{
					pattern: /\)/,
					alias: 'punctuation'
				}
			],
			'quantifier': {
				pattern: /(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/,
				alias: 'number'
			},
			'alternation': {
				pattern: /\|/,
				alias: 'keyword'
			}
		};
	}
});