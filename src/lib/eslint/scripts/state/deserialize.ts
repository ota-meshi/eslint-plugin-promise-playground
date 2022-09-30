import type { RulesConfig } from '../types';

/**
 * Deserialize a given serialized string then update this object.
 * @param {string} serializedString A serialized string.
 * @returns {object} The deserialized state.
 */
export function deserializeState(serializedString: string): {
	code?: string;
	rules?: RulesConfig;
} {
	const state: {
		code?: string;
		rules?: RulesConfig;
	} = {
		code: undefined,
		rules: undefined
	};

	if (serializedString === '') {
		return state;
	}

	try {
		const safeJsonString = window.atob(serializedString);
		const uint8Arr = Uint8Array.from(safeJsonString, (c) => c.charCodeAt(0));
		const jsonText = new TextDecoder().decode(uint8Arr);
		const json = JSON.parse(jsonText);

		if (typeof json === 'object' && json != null) {
			if (typeof json.code === 'string') {
				state.code = json.code;
			}

			if (typeof json.rules === 'object' && json.rules != null) {
				state.rules = {};
				for (const id of Object.keys(json.rules)) {
					state.rules[id] = json.rules[id] === 2 ? 'error' : 'off';
				}
			}
		}
	} catch (error) {
		// eslint-disable-next-line no-console -- Demo
		console.error(error);
	}

	return state;
}
