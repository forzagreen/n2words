/**
 * Scale-range helpers — pure.
 *
 * Each form declares its maximum supported value as a bigint export
 * (`cardinalMax`, `ordinalMax`, `currencyMax`): the smallest value the form
 * refuses, so the largest it converts is that minus one. `UNBOUNDED` (null)
 * means no fixed limit.
 *
 * These helpers derive that bigint from a language's own scale-table size, so
 * the ceiling tracks the vocabulary and can't drift. A language whose shape
 * fits none of them declares the value directly (`bounded(n)` or a literal
 * bigint). They only *produce* a max — the range check that consumes one lives
 * in exceeds-max.js, and the verification checks (boundary, gaps, injectivity)
 * live in the gate. Nothing here throws.
 */

/** No fixed ceiling — recursive/compounding spellers (th-TH, fa-IR, …). */
export const UNBOUNDED = null

/**
 * 3-digit grouping, scale array starting at "thousand" (en-US, de-DE, ru-RU, …).
 * @param {number} scaleCount Number of scale words in the table
 * @returns {bigint} The first unsupported value (10^((scaleCount + 1) * 3))
 */
export function western(scaleCount) {
  return 10n ** BigInt((scaleCount + 1) * 3)
}

/**
 * Myriad (4-digit) grouping — one scale word per power of 10,000 (ja-JP, ko-KR).
 * @param {number} scaleCount Number of scale words in the table
 * @returns {bigint} The first unsupported value
 */
export function myriad(scaleCount) {
  return 10n ** BigInt((scaleCount + 1) * 4)
}

/**
 * South Asian 3-2-2 grouping: a 3-digit base segment then 2 digits per scale
 * word, with the table's index 0 reserved for the (empty) units slot.
 * @param {number} wordCount Length of the scale-word table (including the units slot)
 * @returns {bigint} The first unsupported value
 */
export function indian(wordCount) {
  return 10n ** BigInt(3 + 2 * (wordCount - 1))
}

/**
 * Long scale — each unit (a base scale word, or a prefix) yields two levels
 * (-illion / -illiard), spanning 6 powers of ten. es-*, fr-*, it-IT.
 * @param {number} unitCount Number of base scale words or prefixes
 * @returns {bigint} The first unsupported value (10^(6 * (unitCount + 1)))
 */
export function longScale(unitCount) {
  return 10n ** BigInt(6 * (unitCount + 1))
}

/**
 * Escape hatch: a structural bound given as its base-10 exponent (zh: `bounded(16)`).
 * @param {number} exponent The base-10 exponent of the ceiling
 * @returns {bigint} 10^exponent
 */
export function bounded(exponent) {
  return 10n ** BigInt(exponent)
}
