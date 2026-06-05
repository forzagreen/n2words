/**
 * Scale-range helpers.
 *
 * The conversion contract requires every form to declare its maximum supported
 * magnitude as an exported `*MaxExponent` (the largest n for which the form is
 * well-formed is 10^exponent - 1; at 10^exponent and above it throws RangeError;
 * `UNBOUNDED` means no fixed limit). The gate and the docs read that fact; the
 * guard reads it too.
 *
 * These helpers derive the exponent from a language's own scale table so the
 * number can't drift from the vocabulary. A language whose shape fits none of
 * them just writes the expression inline or declares a literal (verified by the
 * gate either way) — the helpers are convenience, not a requirement.
 */

/** Sentinel for forms with no fixed ceiling (recursive/compounding spellers). */
export const UNBOUNDED = Infinity

/**
 * 3-digit grouping with a scale array that starts at "thousand"
 * (e.g. `['thousand', 'million', …]`). en-US, de-DE, ru-RU, …
 * @param {number} scaleCount Number of scale words in the table
 * @returns {number} Max exponent: 10^((scaleCount + 1) * 3) - 1 is the largest value
 */
export function western(scaleCount) {
  return (scaleCount + 1) * 3
}

/**
 * Myriad (4-digit) grouping — a scale word per power of 10,000. ja-JP, ko-KR.
 * @param {number} scaleCount Number of scale words in the table
 * @returns {number} Max exponent
 */
export function myriad(scaleCount) {
  return (scaleCount + 1) * 4
}

/**
 * South Asian 3-2-2 grouping: a 3-digit base segment then 2 digits per scale
 * word, with the table's index 0 reserved for the (empty) units slot.
 * @param {number} wordCount Length of the scale-word table (including the units slot)
 * @returns {number} Max exponent
 */
export function indian(wordCount) {
  return 3 + 2 * (wordCount - 1)
}

/**
 * Long scale built from a base scale array (each entry yields an -illion and an
 * -illiard). es-*, fr-*.
 * @param {number} baseCount Number of base scale words
 * @returns {number} Max exponent
 */
export function longScale(baseCount) {
  return (2 * baseCount + 2) * 3
}

/**
 * Long scale built from prefixes (each prefix yields an -ilione and an -iliardo,
 * spanning 6 powers of ten). it-IT.
 * @param {number} prefixCount Number of scale prefixes
 * @returns {number} Max exponent
 */
export function longScalePrefix(prefixCount) {
  return 6 * (prefixCount + 1)
}
