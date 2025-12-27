/**
 * Markdownlint configuration for n2words project.
 *
 * Philosophy: Follow modern Markdown standards while maintaining readability.
 * We prioritize functionality over arbitrary line length limits.
 *
 * @see https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md
 */
export default {
  // Disable line length rule (MD013)
  // Rationale: Modern Markdown has no line length requirement.
  // URLs, tables, code examples, and badges often exceed limits naturally.
  line_length: false,

  // Allow multiple headings with the same content (MD024)
  // Useful for repeated section headers like "Example" or "Usage"
  no_duplicate_heading: { siblings_only: true },

  // Allow inline HTML (MD033)
  // Needed for advanced formatting like badges, collapsible sections, etc.
  no_inline_html: false,

  // Allow bare URLs (MD034)
  // Sometimes plain URLs are intentional (e.g., in reference sections)
  no_bare_urls: false
}
