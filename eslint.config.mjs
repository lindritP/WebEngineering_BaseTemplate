// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import love from 'eslint-config-love';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig(
  { ignores: ['dist/', 'node_modules/'] },
  {
    files: ['src/**/*.{js,ts}'],
    extends: [
      js.configs.recommended,
      // Successor of standard-with-typescript (type-aware, uses tsconfig.json).
      // Cast: love is typed with typescript-eslint's config type, which is
      // structurally incompatible with ESLint's own; it works at runtime.
      /** @type {import('eslint').Linter.Config} */ (love),
      tseslint.configs.recommended,
      // Runs Prettier as an ESLint rule and turns off conflicting rules
      eslintPluginPrettierRecommended,
      // Must stay last: disables all formatting rules that clash with Prettier
      eslintConfigPrettier,
    ],
    rules: {
      // DOM helpers receive elements as parameters in order to modify them
      // (style, textContent, value). Reassigning the parameter itself stays forbidden.
      'no-param-reassign': ['error', { props: false }],
      // Destructuring a single property (const { value: name } = field) is less
      // readable than plain property access, so this stylistic rule is relaxed.
      '@typescript-eslint/prefer-destructuring': [
        'error',
        { array: false, object: false },
        { enforceForRenamedProperties: false },
      ],
      // console.error is used on purpose to report failures
      // (failed API requests, missing DOM containers); console.log stays forbidden.
      'no-console': ['error', { allow: ['error'] }],
    },
  }
);
