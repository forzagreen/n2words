import { ConcatenatingScaleLanguage } from '../classes/concatenating-scale-language.js'

/**
 * Italian language converter.
 *
 * Uses segment-based decomposition with concatenation for high performance.
 * Supports:
 * - Phonetic contractions (vowel elision: "ventotto" not "ventiotto")
 * - Accentuation rules for "tre" in compounds ("ventitré")
 * - Concatenation without spaces within segments
 * - Short scale: milione (10^6), miliardo (10^9), bilione (10^12)
 * - "e" connector between scale word and remainder
 * - mille/mila alternation for thousands
 */
export class Italian extends ConcatenatingScaleLanguage {
  negativeWord = 'meno'
  decimalSeparatorWord = 'virgola'
  zeroWord = 'zero'

  onesWords = {
    1: 'uno',
    2: 'due',
    3: 'tre',
    4: 'quattro',
    5: 'cinque',
    6: 'sei',
    7: 'sette',
    8: 'otto',
    9: 'nove'
  }

  teensWords = {
    0: 'dieci',
    1: 'undici',
    2: 'dodici',
    3: 'tredici',
    4: 'quattordici',
    5: 'quindici',
    6: 'sedici',
    7: 'diciassette',
    8: 'diciotto',
    9: 'diciannove'
  }

  // Base tens words (irregular forms)
  tensWordsBase = {
    2: 'venti',
    3: 'trenta',
    4: 'quaranta',
    6: 'sessanta'
  }

  // Generated tens words (regular pattern: ones + "anta")
  tensWords = {
    2: 'venti',
    3: 'trenta',
    4: 'quaranta',
    5: 'cinquanta',
    6: 'sessanta',
    7: 'settanta',
    8: 'ottanta',
    9: 'novanta'
  }

  hundredsWords = {
    1: 'cento',
    2: 'duecento',
    3: 'trecento',
    4: 'quattrocento',
    5: 'cinquecento',
    6: 'seicento',
    7: 'settecento',
    8: 'ottocento',
    9: 'novecento'
  }

  // Phonetic transformation rules for vowel elision
  phoneticRules = {
    io: 'o', // venti + otto → ventotto
    ao: 'o', // quaranta + otto → quarantotto
    oo: 'o', // cento + otto → centotto
    iu: 'u', // venti + uno → ventuno
    au: 'u' // quaranta + uno → quarantuno
  }

  // Scale configuration
  scaleConnector = 'e'
  thousandSingular = 'mille'
  thousandPlural = 'mila'
  thousandPluralIsSuffix = true

  // Scale word prefixes for generating -ilione/-iliardo
  exponentPrefixes = ['m', 'b', 'tr', 'quadr', 'quint', 'sest', 'sett', 'ott', 'nov', 'dec']

  /**
   * Adds accent to final "tre" in compound words (ventitré).
   *
   * @param {string} str The string to process.
   * @returns {string} The string with accentuated "tre".
   */
  postProcess (str) {
    return str.split(' ').map(word => {
      // Only accentuate "tre" when it's part of a compound (word length > 3)
      if (word.slice(-3) === 'tre' && word.length > 3) {
        // First remove any existing accent, then add it back at the end
        return word.replaceAll('tré', 'tre').slice(0, -3) + 'tré'
      }
      // Remove any accents from non-final "tre"
      return word.replaceAll('tré', 'tre')
    }).join(' ')
  }

  /**
   * Gets the scale word for a given index.
   * Italian uses short scale with -ilione/-iliardo pattern.
   *
   * Index mapping:
   * - 2: milione (10^6)
   * - 3: miliardo (10^9)
   * - 4: bilione (10^12)
   * - 5: biliardo (10^15)
   * - etc.
   *
   * @protected
   * @param {number} scaleIndex The scale level (1 = thousand, 2 = million, etc.).
   * @param {bigint} segment The segment value (for pluralization).
   * @returns {string} The scale word.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex < 2) return ''

    // Calculate which prefix and whether -ione or -iardo
    // scaleIndex 2 → prefix[0] + ione (milione)
    // scaleIndex 3 → prefix[0] + iardo (miliardo)
    // scaleIndex 4 → prefix[1] + ione (bilione)
    // scaleIndex 5 → prefix[1] + iardo (biliardo)
    const prefixIndex = Math.floor((scaleIndex - 2) / 2)
    const isIardo = (scaleIndex - 2) % 2 === 1

    const prefix = this.exponentPrefixes[prefixIndex]
    if (!prefix) return ''

    const suffix = isIardo ? 'iliardo' : 'ilione'
    const baseWord = prefix + suffix

    // Pluralize: -one → -oni, -ardo → -ardi
    if (segment > 1n) {
      if (isIardo) {
        return baseWord.slice(0, -1) + 'i' // miliardo → miliardi
      }
      return baseWord.slice(0, -1) + 'i' // milione → milioni
    }

    return baseWord
  }

  /**
   * Converts ones digit to words.
   * Uses "un" instead of "uno" before scale words (millions and above).
   *
   * @protected
   * @param {bigint} ones The ones digit (1-9).
   * @param {number} scaleIndex The scale level.
   * @param {bigint} tens The tens digit.
   * @returns {string} The ones word.
   */
  onesToWords (ones, scaleIndex, tens) {
    // "un" before scale words (milione, miliardo, etc.)
    if (ones === 1n && scaleIndex >= 2 && tens === 0n) {
      return 'un'
    }
    return this.onesWords[ones]
  }

  /**
   * Builds integer words with Italian-specific handling.
   * Overrides to handle the complex scale word and connector logic.
   *
   * @protected
   * @param {bigint} integerPart The integer to convert.
   * @returns {string} The number in words (before post-processing).
   */
  buildIntegerWords (integerPart) {
    // Ensure we're working with BigInt
    const n = BigInt(integerPart)

    if (n === 0n) {
      return this.zeroWord
    }

    // For numbers < 1000, use simple segment conversion
    if (n < 1000n) {
      return this.segmentToWords(n, 0)
    }

    // For numbers 1000-999999, handle thousands specially
    if (n < 1_000_000n) {
      return this.buildThousandsWords(n)
    }

    // For millions and above, use scale word pattern
    return this.buildLargeNumberWords(n)
  }

  /**
   * Builds words for numbers 1000-999999.
   *
   * @private
   * @param {bigint} n The number.
   * @returns {string} The number in words.
   */
  buildThousandsWords (n) {
    const thousands = n / 1000n
    const remainder = n % 1000n

    let result
    if (thousands === 1n) {
      result = this.thousandSingular
    } else {
      const thousandsWords = this.segmentToWords(thousands, 1)
      result = this.applyPhoneticRules(thousandsWords + this.thousandPlural)
    }

    if (remainder > 0n) {
      const remainderWords = this.segmentToWords(remainder, 0)
      // Don't apply phonetic rules across thousands/remainder boundary
      result = result + remainderWords
    }

    return result
  }

  /**
   * Builds words for numbers >= 1,000,000.
   *
   * @private
   * @param {bigint} n The number.
   * @returns {string} The number in words.
   */
  buildLargeNumberWords (n) {
    const parts = []
    let remaining = n

    // Process each scale level from highest to lowest
    // Find the highest scale
    let maxScale = 2
    let testValue = 1_000_000n
    while (testValue * 1000n <= remaining) {
      testValue *= 1000n
      maxScale++
    }

    // Process from highest scale down
    for (let scaleIndex = maxScale; scaleIndex >= 0; scaleIndex--) {
      const divisor = 1000n ** BigInt(scaleIndex)
      const segment = remaining / divisor
      remaining = remaining % divisor

      if (segment === 0n) continue

      if (scaleIndex >= 2) {
        // Millions and above: "segment scaleWord"
        const segmentWords = this.segmentToWords(segment, scaleIndex)
        const scaleWord = this.scaleWordForIndex(scaleIndex, segment)
        parts.push(`${segmentWords} ${scaleWord}`)
      } else if (scaleIndex === 1) {
        // Thousands: concatenated
        if (segment === 1n) {
          parts.push(this.thousandSingular)
        } else {
          const segmentWords = this.segmentToWords(segment, scaleIndex)
          parts.push(this.applyPhoneticRules(segmentWords + this.thousandPlural))
        }
      } else {
        // Ones (scaleIndex === 0): just the segment
        parts.push(this.segmentToWords(segment, 0))
      }
    }

    return this.joinPartsWithConnector(parts)
  }

  /**
   * Joins parts with Italian connector rules.
   * Uses "e" before simple (non-compound) final segment.
   *
   * @private
   * @param {string[]} parts The parts to join.
   * @returns {string} The joined string.
   */
  joinPartsWithConnector (parts) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    // Check if last part is "simple" (no space = no scale word)
    const lastPart = parts[parts.length - 1]
    if (!lastPart.includes(' ') && this.scaleConnector) {
      const allButLast = parts.slice(0, -1).join(', ')
      return `${allButLast} ${this.scaleConnector} ${lastPart}`
    }

    // Multiple scale parts: join with comma or space depending on context
    // For Italian, we use ", " for non-adjacent scales
    // But for adjacent scales (like millions + thousands), we use space
    return parts.join(' ')
  }
}
