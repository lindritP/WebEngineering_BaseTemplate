// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import love from 'eslint-config-love';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  { ignores: ['**/dist/', '**/node_modules/'] },
  {
    files: ['apps/*/src/**/*.{js,ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Successor of standard-with-typescript (type-aware, uses tsconfig.json).
      // Cast: love is typed with typescript-eslint's config type, which is
      // structurally incompatible with ESLint's own; it works at runtime.
      /** @type {import('eslint').Linter.Config} */ (love),
      tseslint.configs.recommended,
      // Runs Prettier as an ESLint rule and turns off conflicting rules
      eslintPluginPrettierRecommended,
      // React Hooks rules (e.g. exhaustive-deps) are not included in the recommended
      eslintPluginReactHooks.configs.flat.recommended,
      // Must stay last: disables all formatting rules that clash with Prettier
      eslintConfigPrettier,
    ],
    rules: {
      // console.error is used on purpose to report failures
      // (failed API requests, missing DOM containers); console.log stays forbidden.
      'no-console': ['error', { allow: ['error'] }],
    },
  }
);
