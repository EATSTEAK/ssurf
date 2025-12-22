// https://docs.expo.dev/guides/using-eslint/

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = defineConfig([
  {
    ignores: ['dist', 'node_modules', '.expo'],
  },
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.eslintRecommended,
      reactHooks.configs.flat['recommended-latest'],
      perfectionist.configs['recommended-natural'],
      eslintConfigPrettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser },
    },
    plugins: {
      react,
      'unused-imports': unusedImports,
      'react-refresh': reactRefresh,
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          selector: 'variableLike',
        },
        {
          format: ['PascalCase'],
          selector: ['typeLike', 'enumMember'],
        },
        {
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          selector: 'typeProperty',
          trailingUnderscore: 'allow',
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      curly: 'error',
      // 아래 자동정렬은 런타임 동작에 영향을 줄 수 있는 것들이에요.
      'perfectionist/sort-enums': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-maps': 'off',
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          newlinesBetween: 'always',
          customGroups: {
            type: {},
            value: {},
          },
        },
      ],
      'react/display-name': [1, { ignoreTranspilerName: false }],
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      // perfectionist의 sorting과 겹칠 수 있어서 off해요.
      'sort-imports': 'off',
      'object-shorthand': ['error', 'always'],
    },
    settings: {
      'import/external-module-folders': ['node_modules'],
      'import/resolver': {},
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/metro.config.js', 'eslint.config.mjs'],

    languageOptions: {
      globals: globals.node,
    },
  },
]);

export default config;
