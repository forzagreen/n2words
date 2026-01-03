// Project scopes for commit messages
const PROJECT_SCOPES = [
  'core', // lib/n2words.js, lib/classes/*
  'lang', // lib/languages/* (general language work)
  'scripts', // scripts/*
  'types', // TypeScript definitions
  'docs', // Documentation
  'test', // Test files and fixtures
  'build', // Build configuration
  'ci', // CI/CD workflows
  'deps', // Dependencies
  'release' // Release-related changes
]

// BCP 47 language code pattern (e.g., "en", "fr-BE", "zh-Hans", "sr-Latn")
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(-[A-Z][a-z]{3,4})?(-[A-Z]{2})?$/

export default {
  extends: ['@commitlint/config-conventional'],
  helpUrl: 'https://github.com/forzagreen/n2words/blob/master/CONTRIBUTING.md#commit-message-format',

  plugins: [
    {
      rules: {
        // Custom scope validation: allows project scopes OR valid language codes
        'scope-pattern': ({ scope }) => {
          // No scope is always valid (scope is optional)
          if (!scope) return [true]

          // Check if it's a known project scope
          if (PROJECT_SCOPES.includes(scope)) return [true]

          // Check if it's a valid BCP 47 language code
          if (LANGUAGE_CODE_PATTERN.test(scope)) return [true]

          return [
            false,
            `scope must be a project area (${PROJECT_SCOPES.join(', ')}) or a valid language code (e.g., en, fr-BE)`
          ]
        }
      }
    }
  ],

  rules: {
    // Type validation
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'lang'
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Custom scope validation (replaces scope-enum)
    'scope-pattern': [2, 'always'],
    'scope-enum': [0], // Disable built-in scope-enum

    // Subject validation
    'subject-empty': [2, 'never'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-full-stop': [2, 'never', '.'],

    // Header validation
    'header-max-length': [2, 'always', 100],

    // Body validation
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [0], // Disabled - body can have long lines (URLs, etc.)

    // Footer validation
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [0] // Disabled - footers often contain long URLs
  }
}
