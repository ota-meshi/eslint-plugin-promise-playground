import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import packageVersions from 'pkg-versions';

import './src/build-system/build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function getPkg(moduleName: string) {
	// eslint-disable-next-line no-shadow -- name
	const { name, homepage, version } = JSON.parse(
		fs.readFileSync(`./node_modules/${moduleName}/package.json`, 'utf8')
	);

	return { name, homepage, version };
}

export default (async (): Promise<UserConfig> => {
	return {
		plugins: [sveltekit()],
		define: {
			__DEPS_PKGS__: {
				'eslint-plugin-promise': getPkg('eslint-plugin-promise'),
				eslint: getPkg('eslint')
			},
			__PKG_VERSIONS__: {
				'eslint-plugin-promise': [...(await packageVersions('eslint-plugin-promise'))].sort(
					(a, b) => b.localeCompare(a)
				)
			},
			MONACO_EDITOR_VERSION: JSON.stringify(getPkg('monaco-editor').version)
		},
		resolve: {
			alias: {
				eslint: path.join(dirname, './src/shim/eslint.mjs'),

				// Node
				assert: path.join(dirname, './src/shim/assert.mjs'),
				path: path.join(dirname, './src/shim/path.mjs')
			}
		}
	};
})();
