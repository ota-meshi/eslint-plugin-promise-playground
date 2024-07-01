/* eslint no-unused-vars: 2 -- mjs */
import globals from 'globals';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import parser from 'svelte-eslint-parser';
import * as tsParser from 'typescript-eslint-parser-for-extra-files';
import myPlugin from '@ota-meshi/eslint-plugin';

export default [
	{
		ignores: [
			'**/.DS_Store',
			'**/node_modules',
			'build',
			'.svelte-kit',
			'package',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock',
			'.vite'
		]
	},
	...myPlugin.config({
		packageJson: true,
		json: true,
		yaml: true,
		md: true,
		svelte: true,
		prettier: true,
		ts: true
	}),
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},
			sourceType: 'module'
		},
		rules: {
			'jsdoc/require-jsdoc': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		plugins: {
			'@typescript-eslint': typescriptEslint
		},
		languageOptions: {
			parser,
			parserOptions: {
				parser: tsParser
			}
		},
		rules: {
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		files: ['**/*.ts'],
		plugins: {
			'@typescript-eslint': typescriptEslint
		},
		languageOptions: {
			parser: tsParser
		},
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
];
