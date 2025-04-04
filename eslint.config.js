// eslint.config.js
import { FlatConfig } from '@angular-eslint/utils';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // TypeScript rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,

  // Angular rules
  FlatConfig.config({
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@angular-eslint': angular,
    },
    rules: {
      ...angular.configs.recommended.rules,

      // Google Style Guide aligned rules
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component'] }],
      '@angular-eslint/directive-class-suffix': ['error', { suffixes: ['Directive'] }],
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',

      // TypeScript best practices
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
      '@typescript-eslint/member-ordering': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-magic-numbers': ['warn', { ignore: [0, 1], ignoreEnums: true, enforceConst: true }],
    },
  }),

  // Angular HTML templates
  FlatConfig.config({
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,

      // Google template guidelines
      '@angular-eslint/template/no-negated-async': 'error',
    },
  }),

  // Prettier integration
  FlatConfig.config({
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  }),
];
