module.exports = {
	root: true,
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest',
		extraFileExtensions: ['.svelte']
	},
	extends: [
		'eslint:recommended',
		'plugin:@ota-meshi/recommended',
		'plugin:@ota-meshi/+package-json',
		'plugin:@ota-meshi/+json',
		'plugin:@ota-meshi/+yaml',
		'plugin:@ota-meshi/+md',
		'plugin:svelte/recommended',
		'plugin:@ota-meshi/+prettier'
	],
	rules: {
		'require-jsdoc': 'off',
		'no-void': ['error', { allowAsStatement: true }]
	},
	overrides: [
		{
			files: ['*.svelte'],
			plugins: ['@typescript-eslint'],
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@ota-meshi/+typescript',
				'plugin:@ota-meshi/+svelte-with-ts'
			],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			},
			rules: {
				'no-shadow': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
			}
		},
		{
			files: ['*.ts'],
			plugins: ['@typescript-eslint'],
			extends: ['plugin:@typescript-eslint/recommended', 'plugin:@ota-meshi/+typescript'],
			parser: '@typescript-eslint/parser',
			rules: {
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-explicit-any': 'off'
			}
		}
	]
};
