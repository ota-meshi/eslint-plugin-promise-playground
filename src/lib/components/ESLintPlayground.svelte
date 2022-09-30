<script lang="ts">
	import type { Linter } from 'eslint';
	import ESLintEditor from '../eslint/ESLintEditor.svelte';
	import RulesSettings from '../eslint/RulesSettings.svelte';
	import { deserializeState, serializeState } from '../eslint/scripts/state';
	import { DEFAULT_RULES_CONFIG, getRule, createLinter } from '../eslint/scripts/linter.js';
	import type { RulesConfig } from '../eslint/scripts/types';
	const linter = createLinter();

	const DEFAULT_CODE = `/* Welcome to eslint-plugin-promise */

const something = new Promise((r) => {
	r(42)
});

something.then((val) => {
	return Promise.resolve(val * 2)
});
`;

	const state = deserializeState(
		(typeof window !== 'undefined' && window.location.hash.slice(1)) || ''
	);
	let code = state.code || DEFAULT_CODE;
	let rules = state.rules || Object.assign({}, DEFAULT_RULES_CONFIG);
	let messages: Linter.LintMessage[] = [];
	let time = '';
	let options = {
		filename: 'example.svelte'
	};
	let editor: ESLintEditor | null = null;

	$: serializedString = (() => {
		const serializeCode = DEFAULT_CODE === code ? undefined : code;
		const serializeRules = equalsRules(DEFAULT_RULES_CONFIG, rules) ? undefined : rules;
		return serializeState({
			code: serializeCode,
			rules: serializeRules
		});
	})();
	$: {
		if (typeof window !== 'undefined') {
			window.location.replace(`#${serializedString}`);
		}
	}
	function onLintedResult(evt: CustomEvent) {
		messages = evt.detail.messages;
		time = `${evt.detail.time}ms`;
	}
	function onUrlHashChange() {
		const newSerializedString =
			(typeof window !== 'undefined' && window.location.hash.slice(1)) || '';
		if (newSerializedString !== serializedString) {
			const state = deserializeState(newSerializedString);
			code = state.code || DEFAULT_CODE;
			rules = state.rules || Object.assign({}, DEFAULT_RULES_CONFIG);
		}
	}

	/** */
	function equalsRules(a: RulesConfig, b: RulesConfig) {
		const akeys = Object.keys(a).filter((k) => a[k] !== 'off');
		const bkeys = Object.keys(b).filter((k) => b[k] !== 'off');
		if (akeys.length !== bkeys.length) {
			return false;
		}

		for (const k of akeys) {
			if (a[k] !== b[k]) {
				return false;
			}
		}
		return true;
	}

	function onClickMessage(evt: MouseEvent, msg: Linter.LintMessage) {
		evt.stopPropagation();
		evt.preventDefault();
		if (editor) {
			editor.setCursorPosition({
				start: {
					line: msg.line,
					column: msg.column
				},
				end: {
					line: msg.endLine ?? msg.line,
					column: msg.endColumn ?? msg.column
				}
			});
		}
	}
</script>

<svelte:window on:hashchange={onUrlHashChange} />

<div class="playground-root">
	<div class="playground-tools">
		<span style:margin-left="16px">{time}</span>
	</div>
	<div class="playground-content">
		<RulesSettings bind:rules />
		<div class="editor-content">
			<ESLintEditor
				bind:this={editor}
				{linter}
				bind:code
				config={{
					parserOptions: {
						ecmaVersion: 'latest',
						sourceType: 'module'
					},
					rules,
					env: {
						browser: true,
						es2021: true
					}
				}}
				{options}
				on:result={onLintedResult}
			/>
			<div class="messages">
				<ol>
					{#each messages as msg, i (`${msg.line}:${msg.column}:${msg.ruleId}@${i}`)}
						<li class="message">
							<!-- svelte-ignore a11y-invalid-attribute -->
							<a href="#" on:click={(evt) => onClickMessage(evt, msg)} class="message-link"
								>[{msg.line}:{msg.column}]</a
							>:
							{msg.message}
							{#if msg.ruleId}
								{@const ruleData = getRule(msg.ruleId)}
								<svelte:element
									this={ruleData.url ? 'a' : 'span'}
									class="rule-link {ruleData.classes}"
									class:is-rule-error={msg.ruleId}
									href={ruleData.url}
									target="_blank"
									rel="noopener noreferrer">({msg.ruleId})</svelte:element
								>
							{/if}
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.main-content) {
		max-width: 100% !important;
	}

	.playground-root {
		height: calc(100vh - 100px);
	}
	.playground-tools {
		height: 24px;
		text-align: end;
	}
	.playground-content {
		display: flex;
		flex-wrap: wrap;
		height: calc(100% - 24px);
		border: 1px solid #cfd4db;
		background-color: #282c34;
		color: #fff;
	}

	.playground-content > .editor-content {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		border-left: 1px solid #cfd4db;
		min-width: 1px;
	}

	.playground-content > .editor-content > .messages {
		height: 30%;
		width: 100%;
		overflow: auto;
		box-sizing: border-box;
		border-top: 1px solid #cfd4db;
		padding: 8px;
		font-size: 12px;
	}
	.playground-content > .editor-content > .messages .rule-link:not(.is-rule-error) {
		display: none;
	}
	.rule-link {
		transition: color 0.2s linear;
	}
	.rule-link.plugin-rule {
		color: var(--color-theme-2-alpha);
	}
	.rule-link.plugin-rule:hover {
		color: var(--color-theme-2);
	}
	.rule-link.core-rule {
		color: var(--color-theme-eslint-alpha);
	}
	.rule-link.core-rule:hover {
		color: var(--color-theme-eslint);
	}
	.message-link {
		color: var(--color-theme-2);
	}
</style>
