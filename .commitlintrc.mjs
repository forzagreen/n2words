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
 *   feat(en-US): add ordinal support        # Single language feature
 *   fix(fr-BE): correct septante handling   # Language-specific fix
 *   perf(ja): optimize with BigInt modulo   # Language optimization
 *   refactor(core): simplify utilities      # Shared code in src/
 *   build: update Rollup config             # Build system (no scope needed)
 *   build(umd): fix browser global name     # UMD-specific build change
 *   build(esm): add tree-shaking hints      # ESM-specific build change
 *   chore(deps-dev): bump dev dependencies  # Dependabot
 *   ci: add Node 22 to test matrix          # CI/CD (type, not scope)
 *   docs: update README                     # Documentation (type, not scope)
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
  'core', // src/* - language files and shared utilities

  // Build & Distribution
  'esm', // ESM bundle output (dist/*.js)
  'umd', // UMD bundle output (dist/*.umd.js)
  'types', // TypeScript declarations, JSDoc → .d.ts

  // Dependencies (Dependabot scopes)
  'deps', // Production dependencies (unused - zero-dep library)
  'deps-dev', // Development dependencies

  // Quality
  'bench', // Benchmarking (bench/index.js)

  // Infrastructure
  'release', // Version bumps, release preparation
  'scripts' // scripts/* - contributor tooling
]

/**
 * BCP 47 language code pattern
 * Examples: en-US, fr-BE, zh-Hans-CN, sr-Latn-RS, pa-Guru-IN
 */
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(-[A-Z][a-z]{3,4})?(-[A-Z]{2})?$/

/**
 * Validates a scope value.
 * Accepts: project scopes (lowercase), language codes (BCP 47 case), or comma-separated language codes.
 *
 * @returns {{ valid: boolean, error?: string }}
 */
function validateScope (scope) {
  // Project scopes must be lowercase
  if (PROJECT_SCOPES.includes(scope)) {
    return { valid: true }
  }

  // Check if it looks like a project scope but wrong case
  if (PROJECT_SCOPES.includes(scope.toLowerCase()) && scope !== scope.toLowerCase()) {
    return { valid: false, error: `Project scope "${scope}" must be lowercase: "${scope.toLowerCase()}"` }
  }

  // BCP 47 language codes (with proper case: en, en-US, en-GB, zh-Hans, sr-Latn)
  if (LANGUAGE_CODE_PATTERN.test(scope)) {
    return { valid: true }
  }

  // Support comma-separated language codes: "zh-Hans-CN, zh-Hant-TW"
  if (scope.includes(',')) {
    const codes = scope.split(',').map(s => s.trim())
    if (codes.every(code => LANGUAGE_CODE_PATTERN.test(code))) {
      return { valid: true }
    }
  }

  return {
    valid: false,
    error: `Invalid scope "${scope}". Use a project area (${PROJECT_SCOPES.slice(0, 5).join(', ')}, ...) or BCP 47 language code (en-US, en-GB, zh-Hans-CN)`
  }
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

          const result = validateScope(scope)
          if (result.valid) return [true]

          return [false, result.error]
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
    'scope-case': [0], // Disabled - custom validation handles case (BCP 47 codes need mixed case)

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
