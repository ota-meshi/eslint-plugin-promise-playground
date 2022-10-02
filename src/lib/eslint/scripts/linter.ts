import { Linter } from 'eslint';
// @ts-expect-error -- Demo
import bundlePlugin from 'eslint-plugin-promise';
import type { RulesConfig } from './types';
import { writable } from 'svelte/store';
export type Category = {
	type?: string;
	title: string;
	classes: string;
	rules: RuleData[];
};
export type RuleData = {
	ruleId: string;
	rule?: any;
	classes?: string;
	url: string;
};
export const DEFAULT_RULES_CONFIG: RulesConfig = {};

const CORE_CATEGORIES: Category[] = [
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

for (const [ruleId, rule] of new Linter().getRules()) {
	if (rule.meta!.deprecated) {
		continue;
	}
	const data: RuleData = {
		ruleId,
		rule,
		classes: 'core-rule',
		url: rule.meta!.docs!.url!
	};
	const type = rule.meta!.type;
	CORE_CATEGORIES.find((c) => c.type === type)!.rules.push(data);

	if (rule.meta!.docs!.recommended) {
		DEFAULT_RULES_CONFIG[ruleId] = 'error';
	}
}

export let categories: Category[] = [...CORE_CATEGORIES];
export const categoriesStore = writable(categories);
export const linterStore = writable(new Linter());

setupPlugin(bundlePlugin);

export function setupPlugin(plugin: any = bundlePlugin): void {
	const pluginCategories: Category[] = [
		{
			title: 'eslint-plugin-promise',
			classes: 'plugin-category',
			rules: []
		}
	];

	for (const ruleName in plugin.rules) {
		const rule = plugin.rules[ruleName];
		const ruleId = `promise/${ruleName}`;
		if (rule.meta?.deprecated) {
			continue;
		}
		const data: RuleData = {
			ruleId,
			rule,
			classes: 'plugin-rule',
			url: rule.meta?.docs?.url
		};
		pluginCategories.find((c) => c.title === 'eslint-plugin-promise')!.rules.push(data);

		let s = plugin.configs?.recommended?.rules?.[ruleId];
		if (Array.isArray(s)) {
			s = s[0];
		}
		s = s === 2 ? 'error' : s === 1 ? 'warn' : s === 0 ? 'off' : s;
		if (s === 'error' || s === 'warn') {
			DEFAULT_RULES_CONFIG[ruleId] = 'error';
		}
	}

	for (const pluginCategory of pluginCategories) {
		pluginCategory.rules.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
	}

	categories = [...pluginCategories, ...CORE_CATEGORIES];
	categoriesStore.set(categories);

	const linter = new Linter();

	for (const ruleName in plugin.rules) {
		const rule = plugin.rules[ruleName];
		const ruleId = `promise/${ruleName}`;
		linter.defineRule(ruleId, rule);
	}

	linterStore.set(linter);
}

/** Get rule data */
export function getRule(ruleId: string | null): RuleData {
	if (ruleId == null) {
		return {
			ruleId: '',
			url: ''
		};
	}
	for (const cat of categories) {
		for (const rule of cat.rules) {
			if (rule.ruleId === ruleId) {
				return rule;
			}
		}
	}
	return { ruleId, url: '' };
}
