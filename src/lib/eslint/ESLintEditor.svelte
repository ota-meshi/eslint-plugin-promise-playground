<script lang="ts">
	import type { Linter } from 'eslint';
	import MonacoEditor, { type SourceLocation } from '@ota-meshi/site-kit-monaco-editor-svelte';
	import { loadMonacoEditor } from '@ota-meshi/site-kit-monaco-editor';
	import type {
		MonacoEditor as MEditor,
		ProvideCodeActions,
		MonacoEditorLanguages,
		Monaco
	} from '@ota-meshi/site-kit-monaco-editor';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { MaybePromise } from './scripts/types';

	const dispatch = createEventDispatcher();

	export let linter: MaybePromise<Linter> | null = null;
	export let code = '';
	export let config: Linter.Config = {};
	export let options: Linter.LintOptions = {};
	export let fix = true;
	export let showDiff = true;
	export let language = 'javascript';

	let fixedValue = code;
	let leftMarkers: MEditor.IMarkerData[] = [];
	let rightMarkers: MEditor.IMarkerData[] = [];

	let messageMap = new Map<string, Linter.LintMessage>();
	let editor: MonacoEditor | null = null;

	export function setCursorPosition(loc: SourceLocation): void {
		if (editor) {
			editor.setCursorPosition(loc);
		}
	}

	$: showApplyFix = fix && fixedValue !== code;
	$: {
		void lint(linter, code, config, options);
	}

	onMount(() => {
		void lint(linter, code, config, options);
	});

	let lastResult: {
		messages?: Linter.LintMessage[];
		fixResult?: Linter.FixReport;
	} = {};

	async function lint(
		linter: MaybePromise<Linter> | null,
		code: MaybePromise<string>,
		config: Linter.Config,
		options: Linter.LintOptions
	) {
		messageMap.clear();
		/* eslint-disable no-param-reassign -- ignore */
		linter = await linter;
		if (!linter) {
			return;
		}
		code = await code;
		// config = await config;
		// options = await options;
		/* eslint-enable no-param-reassign -- ignore */

		const start = Date.now();

		if (typeof require === 'undefined' && typeof window !== 'undefined') {
			// @ts-expect-error -- global Monaco's require
			window.require = function () {
				throw new Error();
			};
		}
		const messages = linter.verify(code, config, options);
		const time = Date.now() - start;

		dispatch('time', time);

		const fixResult = linter.verifyAndFix(code, config, options);
		fixedValue = fixResult.output;

		dispatch('result', {
			messages,
			time,
			output: fixResult.output,
			fixedMessages: fixResult.messages
		});

		lastResult = { messages, fixResult };

		const markers = await Promise.all(messages.map((m) => messageToMarker(m, messageMap)));
		const fixedMarkers = await Promise.all(fixResult.messages.map((m) => messageToMarker(m)));
		if (lastResult.messages !== messages || lastResult.fixResult !== fixResult) {
			// If the result has changed, don't update the markers
			return;
		}
		leftMarkers = markers;
		rightMarkers = fixedMarkers;
	}

	function applyFix() {
		code = fixedValue;
	}
	/** message to marker */
	async function messageToMarker(
		message: Linter.LintMessage,

		messageMap?: Map<string, Linter.LintMessage>
	) {
		const monaco: Monaco = await loadMonacoEditor();
		const rule = message.ruleId && (await linter)!.getRules().get(message.ruleId);
		const docUrl = rule && rule.meta && rule.meta.docs && rule.meta.docs.url;
		const startLineNumber = ensurePositiveInt(message.line, 1);
		const startColumn = ensurePositiveInt(message.column, 1);
		const endLineNumber = ensurePositiveInt(message.endLine, startLineNumber);
		const endColumn = ensurePositiveInt(message.endColumn, startColumn + 1);
		const markerCode = docUrl
			? {
					value: message.ruleId!,
					// Type bug in monaco-editor?
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ignore
					target: docUrl as any
				}
			: message.ruleId || 'FATAL';
		const marker: MEditor.IMarkerData = {
			code: markerCode,
			severity: monaco.MarkerSeverity.Error,
			source: 'ESLint',
			message: message.message,
			startLineNumber,
			startColumn,
			endLineNumber,
			endColumn
		};
		if (messageMap) {
			messageMap.set(computeKey(marker), message);
		}
		return marker;
	}

	/**
	 * Ensure that a given value is a positive value.
	 * @param value The value to check.
	 * @param defaultValue The default value which is used if the `value` is undefined.
	 * @returns The positive value as the result.
	 */
	function ensurePositiveInt(value: number | undefined, defaultValue: number) {
		return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
	}

	// eslint-disable-next-line func-style -- typescript
	const provideCodeActions: ProvideCodeActions = function provideCodeActions(
		model,
		_range,
		context
	) {
		if (context.only !== 'quickfix') {
			return {
				actions: [],
				dispose() {
					/* nop */
				}
			};
		}

		const actions = [];

		for (const marker of context.markers) {
			const message = messageMap.get(computeKey(marker));
			if (!message || !message.ruleId) {
				continue;
			}
			if (message.fix) {
				actions.push(
					createQuickfixCodeAction(
						`Fix this ${message.ruleId} problem`,
						marker,

						model,
						message.fix
					)
				);
			}
			if (message.suggestions) {
				for (const suggestion of message.suggestions) {
					actions.push(
						createQuickfixCodeAction(
							`${suggestion.desc} (${message.ruleId})`,
							marker,

							model,
							suggestion.fix
						)
					);
				}
			}
		}

		return {
			actions,
			dispose() {
				/* nop */
			}
		};
	};

	/**
	 * Computes the key string from the given marker.
	 * @param {import('monaco-editor').editor.IMarkerData} marker marker
	 * @returns {string} the key string
	 */
	function computeKey(marker: MEditor.IMarkerData): string {
		const markerCode =
			(typeof marker.code === 'string' ? marker.code : marker.code && marker.code.value) || '';
		return `[${marker.startLineNumber},${marker.startColumn},${marker.endLineNumber},${marker.endColumn}]-${markerCode}`;
	}
	/**
	 * Create quickfix code action.
	 */
	function createQuickfixCodeAction(
		title: string,
		marker: MEditor.IMarkerData,
		model: MEditor.ITextModel,
		fixObject: { range: [number, number]; text: string }
	): MonacoEditorLanguages.CodeAction {
		const start = model.getPositionAt(fixObject.range[0]);
		const end = model.getPositionAt(fixObject.range[1]);
		const editRange = {
			startLineNumber: start.lineNumber,
			startColumn: start.column,
			endLineNumber: end.lineNumber,
			endColumn: end.column
		};
		return {
			title,
			diagnostics: [marker],
			kind: 'quickfix',
			edit: {
				edits: [
					{
						resource: model.uri,
						textEdit: {
							range: editRange,
							text: fixObject.text
						},
						versionId: model.getVersionId()
					}
				]
			}
		};
	}
</script>

<div class="eslint-editor">
	<MonacoEditor
		bind:this={editor}
		bind:code
		bind:rightCode={fixedValue}
		{language}
		diffEditor={fix && showDiff}
		markers={leftMarkers}
		{rightMarkers}
		{provideCodeActions}
	/>
	<div class="eslint-editor__tools">
		{#if showApplyFix}
			<button on:click={applyFix} type="button">Apply Fix</button>
		{/if}
	</div>
</div>

<style>
	.eslint-editor {
		height: 100%;
		position: relative;
	}
	.eslint-editor__tools {
		display: flex;
		height: 42px;
		position: absolute;
		right: 16px;
		bottom: 16px;
		padding: 8px;
	}
	.eslint-editor__tools > button {
		cursor: pointer;
		background-color: transparent;
		color: #ddd;
		border: solid #ddd 1px;
		border-radius: 4px;
		outline: none;
		padding: 0 16px;
		appearance: none;
	}
	.eslint-editor__tools > button:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
</style>
