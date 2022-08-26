import { addHooks } from '../shared/hooks-util.js';
import { extend, insertBefore } from '../shared/language-util.js';
import clike from './prism-clike.js';
import markup from './prism-markup.js';
import markupTemplating, { MarkupTemplating } from './prism-markup-templating.js';
import php from './prism-php.js';

export default /** @type {import("../types").LanguageProto} */ ({
	id: 'latte',
	require: [clike, markup, markupTemplating, php],
	grammar: {
		'comment': /^\{\*[\s\S]*/,
		'latte-tag': {
			// https://latte.nette.org/en/tags
			pattern: /(^\{(?:\/(?=[a-z]))?)(?:[=_]|[a-z]\w*\b(?!\())/i,
			lookbehind: true,
			alias: 'important'
		},
		'delimiter': {
			pattern: /^\{\/?|\}$/,
			alias: 'punctuation'
		},
		'php': {
			pattern: /\S(?:[\s\S]*\S)?/,
			alias: 'language-php',
			inside: 'php'
		}
	},
	effect(Prism) {
		const markup = Prism.components.getLanguage('markup');
		const markupLatte = extend(markup, 'markup', {});
		insertBefore(markupLatte.tag.inside, 'attr-value', {
			'n-attr': {
				pattern: /n:[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+))?/,
				inside: {
					'attr-name': {
						pattern: /^[^\s=]+/,
						alias: 'important'
					},
					'attr-value': {
						pattern: /=[\s\S]+/,
						inside: {
							'punctuation': [
								/^=/,
								{
									pattern: /^(\s*)["']|["']$/,
									lookbehind: true
								}
							],
							'php': {
								pattern: /\S(?:[\s\S]*\S)?/,
								inside: 'php'
							}
						}
					},
				}
			},
		});

		const templating = new MarkupTemplating(this.id, Prism);
		const lattePattern = /\{\*[\s\S]*?\*\}|\{[^'"\s{}*](?:[^"'/{}]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|\/\*(?:[^*]|\*(?!\/))*\*\/)*\}/g;

		return addHooks(Prism.hooks, {
			'before-tokenize': env => {
				templating.buildPlaceholders(env, lattePattern);
				env.grammar = markupLatte;
			},
			'after-tokenize': env => {
				templating.tokenizePlaceholders(env);
			}
		});
	}
});