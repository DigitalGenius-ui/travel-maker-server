import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
		...js.configs.recommended,
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"no-undef": "error",
			"no-unused-vars": "warn",
			"no-duplicate-imports": "error",
			"array-callback-return": "error",
			"no-async-promise-executor": "error",
			"no-duplicate-case": "error",
			"no-duplicate-imports": "error",
			"no-import-assign": "error",
			"func-name-matching": "error",
			"no-empty": "error",
			"no-empty-function": "error",
		},
	},
]);
