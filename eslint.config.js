import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	// Use TypeScript parser for .svelte.ts rune files
	{
		files: ['**/*.svelte.ts'],
		languageOptions: {
			parser: ts.parser
		}
	},
	// TypeScript handles undefined-variable checking; no-undef is redundant and
	// incorrectly flags DOM globals (Event, setTimeout, HTMLInputElement, etc.)
	{
		files: ['**/*.ts', '**/*.svelte.ts', '**/*.svelte'],
		rules: {
			'no-undef': 'off',
			// Not using a base path in this app
			'svelte/no-navigation-without-base': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			// False positive: new Date().toISOString() is not a reactive Date instance
			'svelte/prefer-svelte-reactivity': 'off'
		}
	},
	{
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/src-tauri/**'],
							message:
								'Frontend code must not import from src-tauri/. Use a service in your feature folder to wrap Tauri commands.'
						}
					]
				}
			]
		}
	},
	{
		ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**', 'src-tauri/**']
	}
];
