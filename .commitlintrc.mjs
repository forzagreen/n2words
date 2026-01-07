/**
 * Commitlint Configuration for n2words
 *
 * Optimized for semantic versioning and automated changelog generation.
 * Compatible with conventional-changelog-angular preset.
 *
 * CHANGELOG-VISIBLE TYPES (appear in release notes):
 *   feat     → "Features" section (MINOR version bump)
 *   fix      → "Bug Fixes" section (PATCH version bump)
 *   perf     → "Performance Improvements" section (PATCH version bump)
 *
 * INTERNAL TYPES (hidden from changelog):
 *   build    → Build system, bundling, compilation
 *   chore    → Maintenance, config, version bumps
 *   ci       → CI/CD workflows and automation
 *   docs     → Documentation only
 *   refactor → Code restructuring without behavior change
 *   revert   → Reverts a previous commit
 *   style    → Formatting, whitespace, linting
 *   test     → Adding or updating tests
 *
 * BREAKING CHANGES:
 *   Append ! after type/scope: feat!: or feat(en)!:
 *   Always triggers MAJOR version bump and appears in changelog
 *
 * SCOPE USAGE EXAMPLES:
 *   feat(en): add ordinal support           # Single language feature
 *   fix(fr-BE): correct septante handling   # Language-specific fix
 *   perf(ja): optimize with BigInt modulo   # Language optimization
 *   feat(lang): add 3 new languages         # Multiple languages
 *   refactor(core): simplify exports        # Main entry point
 *   build: update Rollup config             # Build system
 *   chore(deps-dev): bump dev dependencies  # Dependabot
 *   ci: add Node 22 to test matrix          # CI/CD changes
 *   feat!: breaking API change              # Breaking without scope
 *
 * @see https://www.conventionalcommits.org/
 * @see https://github.com/conventional-changelog/conventional-changelog
 */

// =============================================================================
// Scope Configuration
// =============================================================================

/**
 * Project area scopes - organized by category
 */
const PROJECT_SCOPES = [
  // Code Areas
  'core', // lib/n2words.js - main entry point
  'lang', // lib/languages/* - general multi-language work
  'utils', // lib/utils/* - shared utilities

  // Build & Distribution
  'build', // Rollup, Babel, UMD bundles, bundling pipeline
  'types', // TypeScript declarations, JSDoc → .d.ts

  // Dependencies (zero-dependency library, only dev deps)
  'deps-dev', // Development dependencies (Dependabot)

  // Quality & Testing
  'test', // Test infrastructure, AVA config
  'bench', // Benchmarking (perf.js, memory.js)
  'browser', // Playwright browser tests

  // Infrastructure
  'ci', // GitHub Actions workflows
  'docs', // README, CONTRIBUTING, etc.
  'release', // Version bumps, release preparation
  'scripts' // scripts/* - contributor tooling
]

/**
 * BCP 47 language code pattern
 * Examples: en, fr-BE, zh-Hans, sr-Latn, pa-Guru
 */
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(-[A-Z][a-z]{3,4})?(-[A-Z]{2})?$/

/**
 * Validates a scope value.
 * Accepts: project scopes, language codes, or comma-separated language codes.
 */
function isValidScope (scope) {
  if (PROJECT_SCOPES.includes(scope)) return true
  if (LANGUAGE_CODE_PATTERN.test(scope)) return true

  // Support comma-separated language codes: "zh-Hans, zh-Hant"
  if (scope.includes(',')) {
    const codes = scope.split(',').map(s => s.trim())
    return codes.every(code => LANGUAGE_CODE_PATTERN.test(code))
  }

  return false
}

// =============================================================================
// Commitlint Configuration
// =============================================================================

export default {
  extends: ['@commitlint/config-conventional'],
  helpUrl: 'https://github.com/forzagreen/n2words/blob/main/CONTRIBUTING.md#commit-message-format',

  plugins: [
    {
      rules: {
        'scope-pattern': ({ scope }) => {
          if (!scope) return [true] // Scope is optional

          if (isValidScope(scope)) return [true]

          return [
            false,
            `Invalid scope "${scope}". Use a project area (${PROJECT_SCOPES.slice(0, 5).join(', ')}, ...) or language code (en, fr-BE, zh-Hans)`
          ]
        }
      }
    }
  ],

  rules: {
    // -------------------------------------------------------------------------
    // Type Rules
    // -------------------------------------------------------------------------
    'type-enum': [
      2,
      'always',
      [
        // Changelog-visible (semantic version impact)
        'feat', // New feature (MINOR)
        'fix', // Bug fix (PATCH)
        'perf', // Performance improvement (PATCH)

        // Internal (no version impact, hidden from changelog)
        'build', // Build system changes
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'docs', // Documentation
        'refactor', // Code restructuring
        'revert', // Revert previous commit
        'style', // Formatting/whitespace
        'test' // Test changes
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // -------------------------------------------------------------------------
    // Scope Rules
    // -------------------------------------------------------------------------
    'scope-pattern': [2, 'always'],
    'scope-enum': [0], // Disabled - using custom validation
    'scope-case': [2, 'always', 'lower-case'],

    // -------------------------------------------------------------------------
    // Subject Rules
    // -------------------------------------------------------------------------
    'subject-empty': [2, 'never'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-full-stop': [2, 'never', '.'],

    // -------------------------------------------------------------------------
    // Header Rules
    // -------------------------------------------------------------------------
    'header-max-length': [2, 'always', 100],

    // -------------------------------------------------------------------------
    // Body & Footer Rules
    // -------------------------------------------------------------------------
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [0], // Disabled - URLs can be long
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [0] // Disabled - URLs can be long
  }
}
