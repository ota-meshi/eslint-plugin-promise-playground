import type * as _monaco from 'monaco-editor';
export type Monaco = typeof _monaco;

async function setupMonaco(): Promise<void> {
	if (typeof window !== 'undefined') {
		const monacoScript =
			Array.from(document.head.querySelectorAll('script')).find(
				(script) => script.src && script.src.includes('monaco') && script.src.includes('vs/loader')
			) || (await appendMonacoEditorScript());
		// @ts-expect-error -- global Monaco's require
		window.require.config({
			paths: {
				vs: monacoScript.src.replace(/\/vs\/.*$/u, '/vs')
			},
			'vs/nls': {
				availableLanguages: {
					'*': 'ja'
				}
			}
		});
	}
}

function appendMonacoEditorScript(): Promise<HTMLScriptElement> {
	return new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs/loader.min.js';
		script.onload = () => {
			script.onload = null;

			watch();

			function watch() {
				// @ts-expect-error -- global Monaco's require
				if (window.require) {
					resolve(script);
					return;
				}
				setTimeout(watch, 200);
			}
		};
		document.head.append(script);
	});
}

let setupedMonaco: Promise<void> | null = null;
let editorLoaded: Promise<Monaco> | null = null;

export function loadMonacoEngine(): Promise<void> {
	return setupedMonaco || (setupedMonaco = setupMonaco());
}
export function loadMonacoEditor(): Promise<Monaco> {
	if (editorLoaded) {
		return editorLoaded;
	}
	return (editorLoaded = (async () => {
		const monaco: Monaco = await loadModuleFromMonaco('vs/editor/editor.main');

		return monaco;
	})());
}

export async function loadModuleFromMonaco<T>(moduleName: string): Promise<T> {
	await loadMonacoEngine();
	return new Promise((resolve) => {
		if (typeof window !== 'undefined') {
			// @ts-expect-error -- global Monaco's require
			window.require([moduleName], (r) => {
				resolve(r);
			});
		}
	});
}
