import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import './src/build-system/build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function getPkg(moduleName: string) {
	// eslint-disable-next-line no-shadow -- name
	const { name, homepage, version } = JSON.parse(
		fs.readFileSync(`./node_modules/${moduleName}/package.json`, 'utf8')
	);

	return { name, homepage, version };
}

const config: UserConfig = {
	plugins: [sveltekit()],
	define: {
		__DEPS_PKGS__: {
			'eslint-plugin-promise': getPkg('eslint-plugin-promise'),
			eslint: getPkg('eslint')
		}
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

export default config;
