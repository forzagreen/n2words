// eslint.config.js
import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';
import ava from 'eslint-plugin-ava';
// TODO [+eslint-plugin-import] Re-enable plugin after ESLint v9 support has been worked out
//import import from 'eslint-plugin-import';
import node from 'eslint-plugin-n';
import jsdoc from 'eslint-plugin-jsdoc';
import unicorn from 'eslint-plugin-unicorn';

export default [
  js.configs.recommended,
  ava.configs['flat/recommended'],
  node.configs['flat/recommended'],
  jsdoc.configs['flat/recommended'],
  unicorn.configs['flat/recommended'],
  {
    plugins: {
      '@stylistic/js': stylisticJs,
      ava,
      // TODO [+eslint-plugin-import] Re-enable plugin after ESLint v9 support has been worked out
      //import,
      node,
      jsdoc,
    },
    rules: {
      //
      // -- DEFAULT RULES --
      //
      // Enforce camelCase for variable names
      camelcase: ['error', {
        properties: 'never'
      }],
      // Disallow multiple imports of same module
      'no-duplicate-imports': 'error',
      // Enforce let or const instead of var
      'no-var': 'error',
      //
      // -- STYLISTIC RULES --
      //
      // Enforce omitting parentheses when unnecessary for arrow functions
      '@stylistic/js/arrow-parens': ['error', 'as-needed'],
      // Enforce consistent spacing before & after arrow function
      '@stylistic/js/arrow-spacing': 'error',
      // Enforce consistent brace style usage (1TBS default)
      '@stylistic/js/brace-style': 'error',
      // Enforce indent of two spaces
      '@stylistic/js/indent': [
        'error', 2, {
          'SwitchCase': 1
        }
      ],
      // Remove trailing whitespace
      '@stylistic/js/no-trailing-spaces': 'error',
      // Enforce use of single quotes
      '@stylistic/js/quotes': ['error', 'single'],
      // Enforce use of semicolon to end lines
      '@stylistic/js/semi': 'error',
      // TODO [+eslint-plugin-import] Re-enable plugin after ESLint v9 support has been worked out
      //
      // -- IMPORT RULES --
      //
      // Report modules without exports, or exports without matching import in another module
      /*'import/no-unused-modules': 'error',
      // Report potentially ambiguous parse goal (script vs. module)
      'import/unambiguous': 'error',
      // Report CommonJS require calls and module.exports or exports.*
      'import/no-commonjs': 'error',
      // Report AMD require and define calls
      'import/no-amd': 'error',
      // No Node.js builtin modules
      'import/no-nodejs-modules': 'error',
      // Report imported names marked with @deprecated documentation tag
      'import/no-deprecated': 'error',
      // Ensure all imports appear before other statements
      'import/first': 'error',
      // Ensure consistent use of file extension within the import path
      'import/extensions': ['error', 'always'],
      // Forbid unassigned imports
      'import/no-unassigned-import': ['error'],*/
      //
      // -- AVA RULES --
      //
      'ava/no-ignored-test-files': ['error', {
        files: [
          'test/*'
        ]
      }],
      //
      // -- UNICORN RULES --
      //
      // Enforce a case style for filenames
      'unicorn/filename-case': ['error', {
        'case': 'kebabCase',
        'ignore': [
          '^[a-z]{2,4}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?(.*)$', // IETF RFC 5646 (Locale file naming)
        ]
      }],
    }
  }];
