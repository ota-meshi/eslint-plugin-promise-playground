import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

import './src/build-system/build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: UserConfig = {
	plugins: [sveltekit()],

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
