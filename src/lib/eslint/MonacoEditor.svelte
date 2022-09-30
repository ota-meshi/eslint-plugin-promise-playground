<script lang="ts" context="module">
	import type {
		editor as MEditor,
		languages,
		Range,
		CancellationToken,
		IDisposable
	} from 'monaco-editor';
	import type { TransitionConfig } from 'svelte/transition';

	const appStarting = new Promise((resolve) => setTimeout(resolve, 300));

	export type ProvideCodeActions = (
		model: MEditor.ITextModel,
		range: Range,
		context: languages.CodeActionContext,
		token: CancellationToken
	) => languages.ProviderResult<languages.CodeActionList>;
	export type SourceLocation = {
		start: {
			line: number;
			column: number;
		};
		end: {
			line: number;
			column: number;
		};
	};
</script>

<script lang="ts">
	import { onDestroy, onMount, createEventDispatcher } from 'svelte';
	import { loadMonacoEditor } from './scripts/monaco-loader';
	import type { MaybePromise } from './scripts/types';

	const dispatch = createEventDispatcher();

	export let code = '';
	export let rightCode = '';
	export let language = 'javascript';
	export let readOnly = false;
	export let diffEditor = false;
	export let markers: MEditor.IMarkerData[] = [];
	export let rightMarkers: MEditor.IMarkerData[] = [];
	export let provideCodeActions: ProvideCodeActions | null = null;

	export let waiting: MaybePromise<null | void> = null;
	let rootElement: HTMLDivElement | null = null;
	let editor: MEditor.IStandaloneDiffEditor | MEditor.IStandaloneCodeEditor | null = null;
	// eslint-disable-next-line func-style -- variable
	let setLeftValue: (value: string) => void = () => {
		// init
	};
	// eslint-disable-next-line func-style -- variable
	let setRightValue: (value: string) => void = () => {
		// init
	};
	// eslint-disable-next-line func-style -- variable
	let setLeftMarkers: (markers: MEditor.IMarkerData[]) => void = () => {
		// init
	};
	// eslint-disable-next-line func-style -- variable
	let setRightMarkers: (markers: MEditor.IMarkerData[]) => void = () => {
		// init
	};
	// eslint-disable-next-line func-style -- variable
	let getLeftEditor: () => MEditor.IStandaloneCodeEditor | null = () => null;
	let codeActionProviderDisposable: IDisposable = {
		dispose: () => {
			// init
		}
	};
	const loadingMonaco = loadMonacoEditor();
	const starting = appStarting;

	$: loading = Promise.all([waiting, loadingMonaco, starting]);
	$: {
		if (setLeftValue) {
			setLeftValue(code);
		}
	}
	$: {
		if (setRightValue) {
			setRightValue(rightCode);
		}
	}
	$: {
		if (setLeftMarkers) {
			setLeftMarkers(markers);
		}
	}
	$: {
		if (setRightMarkers) {
			setRightMarkers(rightMarkers);
		}
	}
	$: {
		disposeCodeActionProvider();
		if (provideCodeActions) {
			void loadingMonaco.then((monaco) => {
				codeActionProviderDisposable = monaco.languages.registerCodeActionProvider(language, {
					provideCodeActions(model, ...args) {
						const editor = getLeftEditor?.();
						if (editor?.getModel()!.uri !== model.uri) {
							return {
								actions: [],
								dispose() {
									/* nop */
								}
							};
						}
						return provideCodeActions!(model, ...args);
					}
				});
			});
		}
	}

	let started = false;
	$: if (started) {
		destroy();
		void setup(diffEditor);
	}

	async function setup(diffEditor: boolean) {
		await loading;
		const monaco = await loadingMonaco;
		const options = {
			value: code,
			readOnly,
			theme: 'vs-dark',
			language,
			automaticLayout: true,
			fontSize: 14,
			// tabSize: 2,
			minimap: {
				enabled: false
			},
			renderControlCharacters: true,
			renderIndentGuides: true,
			renderValidationDecorations: 'on' as const,
			renderWhitespace: 'boundary' as const,
			scrollBeyondLastLine: false
		};

		if (diffEditor) {
			editor = monaco.editor.createDiffEditor(rootElement!, {
				originalEditable: true,
				...options
			});
			const original = monaco.editor.createModel(code, language);
			const modified = monaco.editor.createModel(rightCode, language);
			const leftEditor = editor.getOriginalEditor();
			const rightEditor = editor.getModifiedEditor();
			rightEditor.updateOptions({ readOnly: true });
			editor.setModel({ original, modified });
			original.onDidChangeContent(() => {
				const value = original.getValue();
				code = value;
			});

			setLeftValue = (code) => {
				const value = original.getValue();
				if (code !== value) {
					original.setValue(code);
				}
			};
			setRightValue = (code) => {
				const value = modified.getValue();
				if (code !== value) {
					modified.setValue(code);
				}
			};
			setLeftMarkers = (markers) => {
				void updateMarkers(leftEditor, markers);
			};
			setRightMarkers = (markers) => {
				void updateMarkers(rightEditor, markers);
			};
			getLeftEditor = () => leftEditor;

			setLeftMarkers(markers);
			setRightMarkers(rightMarkers);
		} else {
			const codeEditor = (editor = monaco.editor.create(rootElement!, options));
			editor.onDidChangeModelContent(() => {
				const value = codeEditor.getValue();
				code = value;
			});
			editor.onDidChangeCursorPosition((evt) => {
				dispatch('changeCursorPosition', evt);
			});
			editor.onDidFocusEditorText((evt) => {
				dispatch('focusEditorText', evt);
			});
			setLeftValue = (code) => {
				const value = codeEditor.getValue();
				if (code !== value) {
					codeEditor.setValue(code);
				}
			};
			setRightValue = () => {
				/* noop */
			};
			setLeftMarkers = (markers) => {
				void updateMarkers(codeEditor, markers);
			};
			setRightMarkers = () => {
				/* noop */
			};
			getLeftEditor = () => codeEditor;

			setLeftMarkers(markers);
		}
	}

	function destroy() {
		disposeCodeActionProvider();
		dispose(editor);
		// rootElement.innerHTML = ""
		editor = null;
	}

	onMount(() => {
		started = true;
	});
	onDestroy(() => {
		destroy();
	});

	export function setCursorPosition(loc: SourceLocation): void {
		if (editor) {
			const leftEditor = diffEditor
				? (editor as MEditor.IStandaloneDiffEditor)?.getOriginalEditor()
				: editor;
			leftEditor.setSelection({
				startLineNumber: loc.start.line,
				startColumn: loc.start.column,
				endLineNumber: loc.end.line,
				endColumn: loc.end.column
			});
			leftEditor.revealLineInCenter(loc.start.line);
		}
	}
	async function updateMarkers(
		editor: MEditor.IStandaloneCodeEditor,
		markers: MEditor.IMarkerData[]
	) {
		const monaco = await loadingMonaco;
		const model = editor.getModel()!;
		const id = editor.getId();
		monaco.editor.setModelMarkers(model, id, JSON.parse(JSON.stringify(markers)));
	}

	/**
	 * Dispose.
	 * @param x The target object.
	 */
	function dispose(x: any) {
		if (x == null) {
			return;
		}
		if (x.getOriginalEditor) {
			dispose(x.getOriginalEditor());
		}
		if (x.getModifiedEditor) {
			dispose(x.getModifiedEditor());
		}
		if (x.getModel) {
			dispose(x.getModel());
		}
		if (x.dispose) {
			x.dispose();
		}
	}

	function disposeCodeActionProvider() {
		codeActionProviderDisposable.dispose();
	}

	function loadingTypewriter(node: HTMLElement, _opt?: any): TransitionConfig {
		const text = 'Loading...';
		const duration = 300;

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#await loading}
	{#if started}
		<div class="eslint-editor-monaco-root eslint-editor-monaco-root--wait" in:loadingTypewriter />
	{/if}
{:then}
	<div bind:this={rootElement} class="eslint-editor-monaco-root" />
{/await}

<style>
	.eslint-editor-monaco-root {
		width: 100%;
		height: 100%;
	}

	.eslint-editor-monaco-root--wait {
		color: #9cdcfe;
		border: 1px solid #cfd4db;
		background-color: #282c34;
		font-family: Menlo, Monaco, 'Courier New', monospace;
		font-size: 14px;
		line-height: 21px;
		padding-left: 52px;
		box-sizing: border-box;
	}
</style>
