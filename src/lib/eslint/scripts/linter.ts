import { Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
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

for (const [ruleId, rule] of builtinRules) {
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
export const linterStore = writable({ linter: new Linter(), plugins: {} as Record<string, any> });
const pluginCategories: Category[] = [];

setupPlugin(bundlePlugin);

function getNamespace(pluginName: string) {
	const ns = /^eslint-plugin-(.*)/u.exec(pluginName)?.[1];
	if (ns) {
		return ns;
	}
	const res = /^(@.*\/)eslint-plugin-(.*)/u.exec(pluginName);

	return res && res[1] + res[2];
}

// eslint-disable-next-line complexity -- ignore
export function setupPlugin(
	plugin: any = bundlePlugin,
	pluginName = 'eslint-plugin-promise'
): void {
	let pluginCategory = pluginCategories.find((c) => c.title === pluginName);
	if (!pluginCategory) {
		pluginCategory = {
			title: pluginName,
			classes: 'plugin-category',
			rules: []
		};
		pluginCategories.push(pluginCategory);
	}
	pluginCategory.rules = [];

	const ns = getNamespace(pluginName);

	for (const ruleName in plugin.rules) {
		const rule = plugin.rules[ruleName];
		const ruleId = `${ns}/${ruleName}`;
		if (rule.meta?.deprecated) {
			continue;
		}
		const data: RuleData = {
			ruleId,
			rule,
			classes: 'plugin-rule',
			url: rule.meta?.docs?.url
		};
		pluginCategory.rules.push(data);

		let s = plugin.configs?.recommended?.rules?.[ruleId];
		if (Array.isArray(s)) {
			s = s[0];
		}
		s = s === 2 ? 'error' : s === 1 ? 'warn' : s === 0 ? 'off' : s;
		if (s === 'error' || s === 'warn') {
			DEFAULT_RULES_CONFIG[ruleId] = 'error';
		} else {
			delete DEFAULT_RULES_CONFIG[ruleId];
		}
	}

	pluginCategory.rules.sort((a, b) => a.ruleId.localeCompare(b.ruleId));

	categories = [...pluginCategories, ...CORE_CATEGORIES];
	categoriesStore.set(categories);

	const linter = new Linter();
	linterStore.set({
		linter,
		plugins: Object.fromEntries([[pluginName.replace(/^eslint-plugin-/u, ''), plugin]])
	});
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
