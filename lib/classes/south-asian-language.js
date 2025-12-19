import AbstractLanguage from './abstract-language.js'

/**
 * Base class for South Asian languages with shared grouping patterns.
 *
 * This class provides a reusable implementation for South Asian languages that share:
 * - Indian-style number grouping: last 3 digits, then 2-2 (1,23,45,67,89)
 * - Lakh (100,000), Crore (10,000,000), Arab (1,000,000,000) scale words
 * - Standard decimal and negative number handling
 *
 * Used by: Hindi (hi), Bengali (bn), Urdu (ur), Punjabi (pa)
 *
 * Subclasses MUST define:
 * - `belowHundred` array with digit and teen words (0-99)
 * - `scales` array with grouping words (हज़ार, लाख, करोड़, etc.)
 * - `negativeWord`, `decimalSeparatorWord`, `zeroWord` as class properties
 *
 * @abstract
 * @extends AbstractLanguage
 */
class SouthAsianLanguage extends AbstractLanguage {
  /**
   * Split a number into South Asian groups (3, then 2-2 from right).
   *
   * Examples:
   * - 12345 → [1, 23, 45]
   * - 1234567 → [12, 34, 56, 7] (wait, recalculate: 7 | 56 | 34 | 12 = groups [12, 34, 56, 7])
   *
   * @protected
   * @param {bigint} number The number to split
   * @returns {Array<number>} Array of groups from most significant to least
   */
  splitIndian (number) {
    const numStr = number.toString()

    if (numStr.length <= 3) {
      return [Number(numStr)]
    }

    const groups = []
    const last3 = numStr.slice(-3)
    groups.unshift(Number(last3))

    let remaining = numStr.slice(0, -3)
    while (remaining.length > 0) {
      const group = remaining.slice(-2)
      groups.unshift(Number(group))
      remaining = remaining.slice(0, -2)
    }

    return groups
  }

  /**
   * Convert a number below 1000 to words (0-999).
   *
   * @protected
   * @param {number} number Value between 0 and 999
   * @returns {string} Language-specific word representation
   */
  convertBelowThousand (number) {
    if (number === 0) return ''
    if (number < 100) return this.belowHundred[number]

    const hundreds = Math.trunc(number / 100)
    const remainder = number % 100
    const parts = []

    if (hundreds === 1) {
      parts.push(this.belowHundred[1] + ' ' + this.hundredWord)
    } else {
      parts.push(this.belowHundred[hundreds] + ' ' + this.hundredWord)
    }

    if (remainder > 0) {
      parts.push(this.belowHundred[remainder])
    }

    return parts.join(' ')
  }

  /**
   * Convert whole number to cardinal words using South Asian grouping.
   *
   * @param {bigint} number Number to convert
   * @returns {string} Cardinal representation
   */
  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    const groups = this.splitIndian(number)
    const groupCount = groups.length
    const words = []

    for (let i = 0; i < groupCount; i++) {
      const groupValue = groups[i]
      if (groupValue === 0) continue

      const scaleIndex = groupCount - i - 1
      words.push(this.convertBelowThousand(groupValue))
      if (scaleIndex > 0 && this.scales[scaleIndex]) {
        words.push(this.scales[scaleIndex])
      }
    }

    return words.join(' ').trim()
  }
}

export default SouthAsianLanguage
