export default {
  extends: ['@commitlint/config-conventional'],
  helpUrl: 'https://github.com/forzagreen/n2words/blob/master/CONTRIBUTING.md#commit-message-format',

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

    // Scope validation (optional but validated when provided)
    'scope-enum': [
      1,
      'always',
      [
        'deps',
        'ci',
        'docs',
        'test',
        'build',
        'lang',
        'core',
        'types'
      ]
    ],
    'scope-case': [2, 'always', 'lower-case'],

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
