import type { RulesConfig } from '../types';

/**
 * Get only enabled rules to make the serialized data smaller.
 * @param allRules The rule settings.
 * @returns The rule settings for the enabled rules.
 */
function getEnabledRules(allRules: RulesConfig) {
	return Object.keys(allRules).reduce((map, id) => {
		if (allRules[id] === 'error') {
			map[id] = 2;
		}
		return map;
	}, {} as RulesConfig);
}

/**
 * Serialize a given state as a base64 string.
 * @param {State} state The state to serialize.
 * @returns {string} The serialized string.
 */
export function serializeState(state: { code?: string; rules?: RulesConfig }): string {
	const saveData = {
		code: state.code,
		rules: state.rules ? getEnabledRules(state.rules) : undefined
	};
	const jsonString = JSON.stringify(saveData);

	const uint8Arr = new TextEncoder().encode(jsonString);
	const safeJsonString = String.fromCharCode(...uint8Arr);
	const base64 = (typeof window !== 'undefined' && window.btoa(safeJsonString)) || safeJsonString;

	// eslint-disable-next-line no-console -- Demo
	console.log(
		`The compress rate of serialized string: ${((100 * base64.length) / jsonString.length).toFixed(
			1
		)}% (${jsonString.length}B → ${base64.length}B)`
	);

	return base64;
}
