import { ShortScaleLanguage } from '../classes/short-scale-language.js'

/**
 * German language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Compound formation (no separators between words below million)
 * - Three forms of 1 (eins/ein/eine)
 * - Units-before-tens ordering (einundzwanzig = one and twenty)
 * - Long scale naming (Milliarde = 10^9, Billion = 10^12)
 * - Scale word pluralization (Million → Millionen)
 *
 * Note: German uses long scale terminology but with unique words for each
 * power of 1000, so it uses ShortScaleLanguage indexing with German scale names.
 */
export class German extends ShortScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'null'

  onesWords = {
    1: 'eins',
    2: 'zwei',
    3: 'drei',
    4: 'vier',
    5: 'fünf',
    6: 'sechs',
    7: 'sieben',
    8: 'acht',
    9: 'neun'
  }

  teensWords = {
    0: 'zehn',
    1: 'elf',
    2: 'zwölf',
    3: 'dreizehn',
    4: 'vierzehn',
    5: 'fünfzehn',
    6: 'sechzehn',
    7: 'siebzehn',
    8: 'achtzehn',
    9: 'neunzehn'
  }

  tensWords = {
    2: 'zwanzig',
    3: 'dreißig',
    4: 'vierzig',
    5: 'fünfzig',
    6: 'sechzig',
    7: 'siebzig',
    8: 'achtzig',
    9: 'neunzig'
  }

  hundredWord = 'hundert'

  // Scale words: index 0 = thousand, 1 = million, etc.
  // German uses long scale names but each power of 1000 has a unique word
  scaleWords = ['tausend', 'Million', 'Milliarde', 'Billion', 'Billiarde', 'Trillion', 'Trilliarde', 'Quadrillion', 'Quadrilliarde']

  /**
   * Pluralizes German scale words (add -en, or just -n if ends in -e).
   * Only applies to Million and above (tausend doesn't pluralize).
   */
  pluralizeScaleWord (word) {
    if (word === 'tausend') return word
    return word.endsWith('e') ? word + 'n' : word + 'en'
  }

  /**
   * Gets scale word with pluralization for segment > 1.
   */
  scaleWordForIndex (scaleIndex, segment) {
    const word = this.scaleWords[scaleIndex - 1]
    if (!word) return ''

    // Pluralize million+ when segment > 1
    if (scaleIndex >= 2 && segment > 1n) {
      return this.pluralizeScaleWord(word)
    }
    return word
  }

  /**
   * Combines segment parts with German compound rules.
   * German uses inverted order for tens+ones: "einundzwanzig" (one-and-twenty)
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = segment / 100n

    // Build result parts
    const result = []

    // Hundreds
    if (hundreds > 0n) {
      const hundredWord = hundreds === 1n ? 'ein' : this.onesWords[hundreds]
      result.push(hundredWord + this.hundredWord)
    }

    // Tens and ones - German inverts order for 21-99 (except teens)
    if (tens === 1n) {
      // Teens: just add teen word
      result.push(this.teensWords[ones])
    } else if (tens > 1n && ones > 0n) {
      // Inverted: "einundzwanzig" (one-and-twenty)
      const oneWord = ones === 1n ? 'ein' : this.onesWords[ones]
      result.push(oneWord + 'und' + this.tensWords[tens])
    } else if (tens > 1n) {
      // Just tens
      result.push(this.tensWords[tens])
    } else if (ones > 0n && tens === 0n) {
      // Just ones (no tens)
      // Use "eins" for standalone ones at position 0, otherwise context-dependent
      if (scaleIndex === 0 && hundreds === 0n) {
        result.push(this.onesWords[ones])
      } else {
        // After hundreds, use base form
        result.push(ones === 1n ? 'eins' : this.onesWords[ones])
      }
    }

    // German compounds below millions: no spaces
    return result.join('')
  }

  /**
   * Converts segment with special handling for "ein" vs "eine" before scale words.
   */
  segmentToWords (segment, scaleIndex) {
    // For segment=1 before thousands, use "ein" (will compound as "eintausend")
    if (segment === 1n && scaleIndex === 1) {
      return 'ein'
    }

    // For segment=1 before millions+, use "eine" (feminine scale words)
    if (segment === 1n && scaleIndex >= 2) {
      return 'eine'
    }

    return super.segmentToWords(segment, scaleIndex)
  }

  /**
   * Joins segments with spaces only before/after scale words >= million.
   */
  joinSegments (parts, integerPart) {
    if (parts.length <= 1) return parts.join('')

    // German: space before and after scale words >= million
    // But compound (no space) for tausend and below
    // Million+ scale words start at index 1 in scaleWords array
    const millionPlusScales = this.scaleWords.slice(1)

    const result = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const prevPart = i > 0 ? parts[i - 1] : null

      // Check if current or previous is a million+ scale word
      const isMillionScale = millionPlusScales.some(sw =>
        part === sw || part === this.pluralizeScaleWord(sw)
      )
      const prevIsMillionScale = prevPart && millionPlusScales.some(sw =>
        prevPart === sw || prevPart === this.pluralizeScaleWord(sw)
      )

      if (i > 0 && (isMillionScale || prevIsMillionScale)) {
        result.push(' ')
      }
      result.push(part)
    }

    return result.join('')
  }
}
