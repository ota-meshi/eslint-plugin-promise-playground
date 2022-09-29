import { Linter } from 'eslint';
// @ts-expect-error -- Demo
import plugin from 'eslint-plugin-promise';
export type Category = {
	type?: string;
	title: string;
	classes: string;
	rules: any[];
};
export const categories: Category[] = [
	{
		title: 'eslint-plugin-promise',
		classes: 'svelte-category',
		rules: []
	},
	{
		type: 'problem',
		title: 'Possible Errors (CORE)',
		classes: 'core-category',
		rules: []
	},
	{
		type: 'suggestion',
		title: 'Suggestions (CORE)',
		classes: 'core-category',
		rules: []
	},
	{
		type: 'layout',
		title: 'Layout & Formatting (CORE)',
		classes: 'core-category',
		rules: []
	}
];
export const DEFAULT_RULES_CONFIG: Record<string, 'error'> = {};

const rules = [];
for (const ruleName in plugin.rules) {
	const rule = plugin.rules[ruleName];
	const ruleId = `promise/${ruleName}`;
	if (rule.meta.deprecated) {
		continue;
	}
	const data = {
		ruleId,
		rule,
		classes: 'svelte-rule',
		url: rule.meta.docs.url
	};
	rules.push(data);
	categories.find((c) => c.title === 'eslint-plugin-promise')!.rules.push(data);

	// if (rule.meta.docs.recommended) {
	DEFAULT_RULES_CONFIG[ruleId] = 'error';
	// }
}
for (const [ruleId, rule] of new Linter().getRules()) {
	if (rule.meta!.deprecated) {
		continue;
	}
	const data = {
		ruleId,
		rule,
		classes: 'core-rule',
		url: rule.meta!.docs!.url
	};
	rules.push(data);
	const type = rule.meta!.type;
	categories.find((c) => c.type === type)!.rules.push(data);

	if (rule.meta!.docs!.recommended && ruleId !== 'no-inner-declarations') {
		DEFAULT_RULES_CONFIG[ruleId] = 'error';
	}
}

/** Get rule data */
export function getRule(ruleId: string): any {
	for (const cat of categories) {
		for (const rule of cat.rules) {
			if (rule.ruleId === ruleId) {
				return rule;
			}
		}
	}
	return {};
}

export function createLinter(): Linter {
	const linter = new Linter();

	for (const ruleName in plugin.rules) {
		const rule = plugin.rules[ruleName];
		const ruleId = `promise/${ruleName}`;
		linter.defineRule(ruleId, rule);
	}

	return linter;
}
