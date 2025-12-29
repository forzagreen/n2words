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
      2,
      'never',
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
  },

  prompt: {
    settings: {
      enableMultipleScopes: false,
      scopeEnumSeparator: ',',
      allowCustomScopes: true,
      allowEmptyScopes: true,
      allowBreakingChanges: ['feat', 'fix']
    },
    messages: {
      skip: 'Press enter to skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit'
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: 'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑'
          },
          lang: {
            description: 'Language implementation changes',
            title: 'Languages',
            emoji: '🌍'
          }
        }
      },
      scope: {
        description: 'What is the scope of this change (optional)'
      },
      subject: {
        description: 'Write a short, imperative tense description of the change'
      },
      body: {
        description: 'Provide a longer description of the change (optional)'
      },
      isBreaking: {
        description: 'Are there any breaking changes?'
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself'
      },
      breaking: {
        description: 'Describe the breaking changes'
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?'
      },
      issuesBody: {
        description: 'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself'
      },
      issues: {
        description: "Add issue references (e.g. 'fix #123', 'closes #456')"
      }
    }
  },

  // Custom formatter for better error messages
  formatter: '@commitlint/format'
}
