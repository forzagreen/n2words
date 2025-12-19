import AbstractLanguage from './abstract-language.js'

/**
 * Base class for Slavic and related languages with complex pluralization.
 *
 * This class provides a reusable implementation for languages that share:
 * - Three-form pluralization (singular/few/many)
 * - Gender-aware number forms (masculine/feminine for 1, 2)
 * - Hundreds, tens, ones decomposition
 * - Chunk-based large number handling (thousands, millions, etc.)
 * - Inherits decimal handling from AbstractLanguage (supports both grouped and
 *   per-digit modes via the `convertDecimalsPerDigit` class property).
 *
 * Used by: Russian, Czech, Polish, Ukrainian, Serbian, Croatian,
 * as well as Baltic (Lithuanian, Latvian) and Hebrew languages.
 *
 * Subclasses MUST define these properties with language-specific vocabulary:
 * - `ones` - Object mapping 1-9 to masculine forms
 * - `onesFeminine` - Object mapping 1-9 to feminine forms
 * - `tens` - Object mapping 0-9 to teen numbers (10-19)
 * - `twenties` - Object mapping 2-9 to tens (20-90)
 * - `hundreds` - Object mapping 1-9 to hundreds (100-900)
 * - `thousands` - Object mapping power indices to [singular, few, many] forms
 *
 * @abstract
 * @extends AbstractLanguage
 */
class SlavicLanguage extends AbstractLanguage {
  /**
   * Masculine forms for digits 1-9.
   *
   * @type {object}
   */
  ones = {}

  /**
   * Feminine forms for digits 1-9.
   *
   * @type {object}
   */
  onesFeminine = {}

  /**
   * Words for tens (10, 20, 30, etc.).
   *
   * @type {object}
   */
  tens = {}

  /**
   * Special forms for 21-29 in some languages.
   *
   * @type {object}
   */
  twenties = {}

  /**
   * Words for hundreds (100, 200, 300, etc.).
   *
   * @type {object}
   */
  hundreds = {}

  /**
   * Scale words for thousands, millions, etc.
   *
   * @type {object}
   */
  thousands = {}

  /**
   * Initializes the Slavic language converter with language-specific options.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {boolean} [options.feminine=false] Use feminine forms for numbers (affects gender agreement).
   */
  constructor ({ feminine = false } = {}) {
    super()

    this.feminine = feminine
  }

  /**
   * Converts a whole number to its word representation.
   *
   * This method implements the Slavic number construction algorithm:
   * 1. Split number into 3-digit chunks (right to left)
   * 2. For each chunk: convert hundreds, tens, ones
   * 3. Apply gender rules for ones (feminine for thousands, or when feminine=true)
   * 4. Add pluralized power word (thousand/million/billion/etc.)
   * 5. Join all parts with spaces
   *
   * @param {bigint} number The whole number to convert (non-negative).
   * @returns {string} The number in words.
   */
  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }

    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length

    for (const x of chunks) {
      let ones = []
      index = index - 1

      if (x === 0n) {
        continue
      }

      const [n1, n2, n3] = this.getDigits(x)

      // Add hundreds word if present
      if (n3 > 0n) {
        words.push(this.hundreds[n3])
      }

      // Add tens word (20, 30, 40, ... 90)
      if (n2 > 1n) {
        words.push(this.twenties[n2])
      }

      // Handle teens (10-19) or ones (1-9)
      if (n2 === 1n) {
        // Teens: use tens array directly
        words.push(this.tens[n1])
      } else if (n1 > 0n) {
        // Ones: use feminine form for thousands (index 1) or when feminine=true (index 0)
        ones =
          index === 1 || (this.feminine && index === 0)
            ? this.onesFeminine
            : this.ones
        words.push(ones[n1])
      }

      // Add power word (thousand, million, etc.) with proper pluralization
      if (index > 0) {
        words.push(this.pluralize(x, this.thousands[index]))
      }
    }

    return words.join(' ')
  }

  /**
   * Splits a number string into chunks of X digits.
   *
   * Example: splitByX('1234567', 3) => [1n, 234n, 567n]
   *
   * @param {string} n The number as a string.
   * @param {number} x Chunk size (typically 3 for thousands grouping).
   * @returns {bigint[]} Array of BigInt chunks.
   */
  splitByX (n, x) {
    const results = []
    const l = n.length

    if (l > x) {
      const start = l % x

      if (start > 0) {
        results.push(BigInt(n.slice(0, start)))
      }

      for (let i = start; i < l; i += x) {
        results.push(BigInt(n.slice(i, i + x)))
      }
    } else {
      results.push(BigInt(n))
    }

    return results
  }

  /**
   * Extracts individual digits from a number (units, tens, hundreds).
   *
   * Returns digits in reverse order: [ones, tens, hundreds]
   * Example: 456 => [6n, 5n, 4n]
   *
   * @param {bigint} value The number to extract digits from (0-999).
   * @returns {bigint[]} Array of [ones, tens, hundreds] as BigInts.
   */
  getDigits (value) {
    // Direct BigInt arithmetic is faster than string manipulation
    const ones = value % 10n
    const tens = (value / 10n) % 10n
    const hundreds = value / 100n
    return [ones, tens, hundreds]
  }

  /**
   * Selects the correct plural form based on Slavic pluralization rules.
   *
   * Slavic languages use three forms:
   * - Form 0 (singular): numbers ending in 1 (but not 11)
   * - Form 1 (few): numbers ending in 2-4 (but not 12-14)
   * - Form 2 (many): all other numbers (0, 5-20, 25-30, etc.)
   *
   * Examples (Russian):
   * - 1, 21, 31... => тысяча (form 0)
   * - 2-4, 22-24, 32-34... => тысячи (form 1)
   * - 0, 5-20, 25-30... => тысяч (form 2)
   *
   * @param {bigint} n The number to check.
   * @param {string[]} forms Array of [singular, few, many] forms.
   * @returns {string} The appropriate form for the number.
   */
  pluralize (n, forms) {
    const mod100 = n % 100n
    const mod10 = n % 10n

    // Check if in 11-19 range (special case)
    if (mod100 >= 10n && mod100 <= 20n) {
      return forms[2] // Always use "many" form for 11-20
    }

    if (mod10 === 1n) {
      return forms[0] // Singular
    }

    if (mod10 >= 2n && mod10 <= 4n) {
      return forms[1] // Few (2-4)
    }

    return forms[2] // Many
  }
}

export default SlavicLanguage

