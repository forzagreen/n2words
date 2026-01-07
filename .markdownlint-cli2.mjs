/**
 * Markdownlint-cli2 configuration for n2words project.
 *
 * Defines which files to lint and which to ignore.
 * Rule configuration is in .markdownlint.mjs
 *
 * @see https://github.com/DavidAnson/markdownlint-cli2
 */
export default {
  // Lint all markdown files in the project
  globs: ['**/*.md'],

  // Ignore dependencies and auto-generated files
  ignores: ['node_modules', 'CHANGELOG.md']
}
