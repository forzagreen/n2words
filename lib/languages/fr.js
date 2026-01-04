import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * French language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Vigesimal patterns: 70 = soixante-dix, 80 = quatre-vingts, 90 = quatre-vingt-dix
 * - "et" conjunction: vingt et un, trente et un... (but NOT quatre-vingt-un)
 * - Pluralization: cents/vingt lose 's' when followed by more digits
 * - Long scale: milliard (10^9), billion (10^12), billiard (10^15)
 * - Optional hyphen separator mode
 *
 * Compound scale: million (10^6), milliard (10^9), billion (10^12),
 *                 billiard (10^15), trillion (10^18), etc.
 */
export class French extends ScaleLanguage {
  negativeWord = 'moins'
  decimalSeparatorWord = 'virgule'
  zeroWord = 'zéro'

  onesWords = {
    1: 'un',
    2: 'deux',
    3: 'trois',
    4: 'quatre',
    5: 'cinq',
    6: 'six',
    7: 'sept',
    8: 'huit',
    9: 'neuf'
  }

  teensWords = {
    0: 'dix',
    1: 'onze',
    2: 'douze',
    3: 'treize',
    4: 'quatorze',
    5: 'quinze',
    6: 'seize',
    7: 'dix-sept',
    8: 'dix-huit',
    9: 'dix-neuf'
  }

  tensWords = {
    2: 'vingt',
    3: 'trente',
    4: 'quarante',
    5: 'cinquante',
    6: 'soixante',
    7: 'soixante', // 70s use 60 + teens
    8: 'quatre-vingt', // No 's' base form
    9: 'quatre-vingt' // 90s use 80 + teens
  }

  // Hundreds without separator (separator added in hundredsToWords)
  hundredsWords = {
    1: 'cent',
    2: 'deux',
    3: 'trois',
    4: 'quatre',
    5: 'cinq',
    6: 'six',
    7: 'sept',
    8: 'huit',
    9: 'neuf'
  }

  hundredWord = 'cent'

  // Compound scale configuration (European long scale)
  scaleMode = 'compound'
  thousandWord = 'mille'
  scaleWords = ['million', 'billion', 'trillion', 'quadrillion']

  // Intermediate scale words for -ard forms (10^9, 10^15, etc.)
  scaleArds = ['milliard', 'billiard', 'trilliard', 'quadrilliard']

  constructor (options = {}) {
    super()

    this.setOptions({
      withHyphenSeparator: false
    }, options)

    if (this.options.withHyphenSeparator) {
      this.wordSeparator = '-'
    }
  }

  /**
   * Converts a 3-digit segment (0-999) to words.
   *
   * French vigesimal: 70-79 and 90-99 use compound forms.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds
    if (hundreds > 0n) {
      parts.push(this.hundredsToWords(hundreds, scaleIndex, segment))
    }

    // Tens and ones - handle vigesimal pattern
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds, nothing more
    } else if (tensOnes < 10n) {
      // Single digit
      parts.push(this.onesWords[ones])
    } else if (tensOnes < 17n) {
      // 10-16: regular teens
      parts.push(this.teensWords[ones])
    } else if (tensOnes < 20n) {
      // 17-19: dix-sept, dix-huit, dix-neuf
      parts.push(this.teensWords[ones])
    } else if (tensOnes < 70n) {
      // 20-69: standard tens + ones
      if (ones === 0n) {
        parts.push(this.tensWords[tens])
      } else if (ones === 1n) {
        // "et un" for 21, 31, 41, 51, 61
        parts.push(this.tensWords[tens])
        parts.push('et')
        parts.push(this.onesWords[1])
      } else {
        parts.push(this.tensWords[tens])
        parts.push(this.onesWords[ones])
      }
    } else if (tensOnes < 80n) {
      // 70-79: soixante-dix, soixante et onze, soixante-douze...
      const remainder = tensOnes - 60n
      if (remainder === 11n) {
        // 71: soixante et onze
        parts.push('soixante')
        parts.push('et')
        parts.push('onze')
      } else {
        // 70, 72-79: soixante-dix, soixante-douze...
        parts.push('soixante')
        parts.push(this.teensWords[remainder - 10n])
      }
    } else if (tensOnes === 80n) {
      // 80: quatre-vingts (with 's')
      parts.push('quatre-vingts')
    } else if (tensOnes < 100n) {
      // 81-99: quatre-vingt-un, quatre-vingt-dix...
      const remainder = tensOnes - 80n
      if (remainder < 10n) {
        // 81-89
        parts.push('quatre-vingt')
        parts.push(this.onesWords[remainder])
      } else {
        // 90-99
        parts.push('quatre-vingt')
        parts.push(this.teensWords[remainder - 10n])
      }
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Converts hundreds with French pluralization.
   * "cents" when followed by nothing within segment, "cent" when followed by more.
   * Note: "cents" may be stripped to "cent" in joinSegments if followed by mille.
   */
  hundredsToWords (hundreds, scaleIndex, segment) {
    const remainder = segment % 100n
    const sep = this.options.withHyphenSeparator ? '-' : ' '

    if (hundreds === 1n) {
      // "cent" (never "un cent")
      return this.hundredWord
    }

    // "deux cents" when alone in segment, "deux cent" when followed by more in segment
    if (remainder === 0n) {
      return `${this.hundredsWords[hundreds]}${sep}${this.hundredWord}s`
    }
    return `${this.hundredsWords[hundreds]}${sep}${this.hundredWord}`
  }

  /**
   * Combines segment parts with French rules.
   * Handles hyphenation vs space between number components.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''

    // With hyphen separator mode: use hyphen everywhere
    if (this.options.withHyphenSeparator) {
      return parts.join('-')
    }

    // Join with appropriate separator
    // French uses hyphen between tens-ones but space around "et"
    const result = []
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        if (parts[i] === 'et' || parts[i - 1] === 'et') {
          result.push(' ')
        } else if (parts[i - 1].includes('cent') && !parts[i - 1].endsWith('s')) {
          // Space after "cent" (not "cents")
          result.push(' ')
        } else {
          result.push('-')
        }
      }
      result.push(parts[i])
    }
    return result.join('')
  }

  /**
   * Gets scale word for French long scale with -ard pattern.
   *
   * French uses:
   * - Index 1: mille (thousand)
   * - Index 2: million (10^6)
   * - Index 3: milliard (10^9) = thousand million
   * - Index 4: billion (10^12)
   * - Index 5: billiard (10^15) = thousand billion
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }

    // Even indices (2, 4, 6, 8): million, billion, trillion, quadrillion
    // Odd indices > 1 (3, 5, 7, 9): milliard, billiard, trilliard, quadrilliard
    if (scaleIndex % 2 === 0) {
      const arrayIndex = (scaleIndex / 2) - 1
      const baseWord = this.scaleWords[arrayIndex]
      if (!baseWord) return ''
      return segment > 1n ? this.pluralizeScaleWord(baseWord) : baseWord
    } else {
      // Odd indices use -ard forms (but NOT compound like Portuguese)
      const arrayIndex = ((scaleIndex - 1) / 2) - 1
      const ardWord = this.scaleArds[arrayIndex]
      if (!ardWord) return this.thousandWord
      return segment > 1n ? this.pluralizeScaleWord(ardWord) : ardWord
    }
  }

  /**
   * Pluralizes French scale words (add 's').
   */
  pluralizeScaleWord (word) {
    return word + 's'
  }

  /**
   * Joins segments with French rules.
   * - Omit "un" before mille
   * - Strip 's' from "cents" / "vingts" when followed by mille
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    // Process parts
    const filtered = []
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      const nextPart = parts[i + 1]

      // Skip "un" if followed by "mille"
      if (part === 'un' && nextPart === 'mille') {
        continue
      }

      // Strip trailing 's' from "cents" or "vingts" if followed by "mille"
      // (keeps 's' when followed by million+)
      if (nextPart === 'mille' && (part.endsWith('cents') || part.endsWith('vingts'))) {
        part = part.slice(0, -1)
      }

      filtered.push(part)
    }

    return filtered.join(this.wordSeparator)
  }
}
