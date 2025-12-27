/**
 * Markdownlint configuration for n2words project.
 *
 * Philosophy: Follow modern Markdown standards while maintaining readability.
 * We prioritize functionality over arbitrary line length limits.
 *
 * Based on popular open-source project practices (Node.js, TypeScript, Rollup).
 *
 * @see https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md
 */
export default {
  // ============================================================================
  // Disabled Rules
  // ============================================================================

  // MD013 - Line length
  // Rationale: Modern Markdown has no line length requirement.
  // URLs, tables, code examples, and badges often exceed limits naturally.
  MD013: false,

  // MD033 - Inline HTML
  // Rationale: Needed for advanced formatting like badges, collapsible sections, etc.
  MD033: false,

  // MD034 - Bare URLs
  // Rationale: Sometimes plain URLs are intentional (e.g., in reference sections)
  MD034: false,

  // MD041 - First line heading
  // Rationale: Templates and some documentation files intentionally start with non-headings
  MD041: false,

  // ============================================================================
  // Configured Rules
  // ============================================================================

  // MD024 - Multiple headings with the same content
  // Only check sibling headings (allows "Added", "Changed" in different changelog versions)
  // Critical for changelogs with repeated section names under different parent headings
  MD024: { siblings_only: true },

  // MD004 - List marker style
  // Enforce consistent unordered list markers (dash style)
  MD004: { style: 'dash' },

  // MD007 - Unordered list indentation
  // Enforce 2-space indentation for nested lists (matches .editorconfig)
  MD007: { indent: 2 },

  // MD030 - Spaces after list markers
  // Enforce single space after list markers
  MD030: { ul_single: 1, ul_multi: 1, ol_single: 1, ol_multi: 1 }
}
