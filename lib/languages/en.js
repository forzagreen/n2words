import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * English language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Hyphenated compounds (e.g., "twenty-three")
 * - "and" after hundreds (e.g., "one hundred and one")
 * - "and" after scale words before small numbers (e.g., "one thousand and one")
 * - Numbers up to octillions
 */
export class English extends ScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  onesWords = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine'
  }

  teensWords = {
    0: 'ten',
    1: 'eleven',
    2: 'twelve',
    3: 'thirteen',
    4: 'fourteen',
    5: 'fifteen',
    6: 'sixteen',
    7: 'seventeen',
    8: 'eighteen',
    9: 'nineteen'
  }

  tensWords = {
    2: 'twenty',
    3: 'thirty',
    4: 'forty',
    5: 'fifty',
    6: 'sixty',
    7: 'seventy',
    8: 'eighty',
    9: 'ninety'
  }

  hundredWord = 'hundred'

  scaleWords = [
    'thousand',
    'million',
    'billion',
    'trillion',
    'quadrillion',
    'quintillion',
    'sextillion',
    'septillion',
    'octillion'
  ]

  /**
   * Combines segment parts with English hyphenation and "and" rules.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''

    const tensOnes = segment % 100n
    const hasHundreds = segment >= 100n

    if (hasHundreds) {
      // parts[0] is hundreds, rest is tens/ones
      const tensOnesParts = parts.slice(1)
      let tensOnesPart = ''

      if (tensOnesParts.length === 2 && tensOnes > 20n) {
        // Hyphenate "twenty-three" etc.
        tensOnesPart = `${tensOnesParts[0]}-${tensOnesParts[1]}`
      } else {
        tensOnesPart = tensOnesParts.join(' ')
      }

      // Add "and" after hundreds if there's a remainder
      if (tensOnesPart) {
        return `${parts[0]} and ${tensOnesPart}`
      }
      return parts[0]
    } else {
      // No hundreds - just handle hyphenation for tens+ones
      if (parts.length === 2 && tensOnes > 20n) {
        return `${parts[0]}-${parts[1]}`
      }
      return parts.join(' ')
    }
  }

  /**
   * Converts hundreds with proper "one hundred" form.
   */
  hundredsToWords (hundreds, scaleIndex) {
    return `${this.onesWords[hundreds]} ${this.hundredWord}`
  }

  /**
   * Join segments with "and" before final small segment when needed.
   *
   * English uses "and" before the final segment if:
   * - The final segment is < 100
   * - There's a scale word before it (thousand, million, etc.)
   * Example: "one thousand and one", "one million and fifty"
   */
  joinSegments (parts, integerPart) {
    if (parts.length <= 1) return parts.join(' ')

    // Check if we need to insert "and" before the final segment
    const lastPart = parts[parts.length - 1]
    const secondLastPart = parts[parts.length - 2]

    // If second-to-last is a scale word and last doesn't contain "hundred"
    // then we need "and"
    const isSecondLastScale = this.scaleWords.includes(secondLastPart)
    const lastContainsHundred = lastPart.includes(this.hundredWord)

    if (isSecondLastScale && !lastContainsHundred) {
      const result = [...parts]
      result.splice(parts.length - 1, 0, 'and')
      return result.join(' ')
    }

    return parts.join(' ')
  }
}
