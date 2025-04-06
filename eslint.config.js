import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import prettierPlugin from 'eslint-plugin-prettier';
import templateParser from '@angular-eslint/template-parser';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.angular/**'],
  },
  {
    files: ['src/app/**/*.ts'],
    // Need to override this or the inject() method for doing DI in Angular will show an error
    // This is specially important for the effects file where if Actions was injected after the actual created effect method, the
    // action$ will be undefined and will throw an error when the Effect is initialized at provideEffects()
    rules: {
      '@typescript-eslint/member-ordering': 'off', // Overriding a specific rule for these files
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      '@angular-eslint': angular,
    },
    rules: {
      ...angular.configs.recommended.rules,

      // Angular style rules
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component'] }],
      '@angular-eslint/directive-class-suffix': ['error', { suffixes: ['Directive'] }],
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',

      // TS rules
      '@typescript-eslint/member-ordering': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1],
          enforceConst: true,
          detectObjects: false,
          ignoreArrayIndexes: false,
          ignoreDefaultValues: false,
          ignoreClassFieldInitialValues: false,
        },
      ],
    },
  },

  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      '@angular-eslint/template/no-negated-async': 'error',
    },
  },

  {
    files: ['src/**/*.{ts,json,md}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
