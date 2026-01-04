import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Dutch language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Units-before-tens ordering (eenentwintig = one and twenty)
 * - "ën" vs "en" connector based on vowel adjacency
 * - Long scale with -ard forms (miljard, biljard, triljard)
 * - Compound word formation without spaces
 * - "één" vs "een" (accented vs unaccented one)
 * - Hundred pairing (1100-9999): "elfhonderd" style by default
 * - Optional "en" (and) separator
 */
export class Dutch extends ScaleLanguage {
  negativeWord = 'min'
  decimalSeparatorWord = 'komma'
  zeroWord = 'nul'

  onesWords = {
    1: 'een',
    2: 'twee',
    3: 'drie',
    4: 'vier',
    5: 'vijf',
    6: 'zes',
    7: 'zeven',
    8: 'acht',
    9: 'negen'
  }

  teensWords = {
    0: 'tien',
    1: 'elf',
    2: 'twaalf',
    3: 'dertien',
    4: 'veertien',
    5: 'vijftien',
    6: 'zestien',
    7: 'zeventien',
    8: 'achttien',
    9: 'negentien'
  }

  tensWords = {
    2: 'twintig',
    3: 'dertig',
    4: 'veertig',
    5: 'vijftig',
    6: 'zestig',
    7: 'zeventig',
    8: 'tachtig',
    9: 'negentig'
  }

  hundredWord = 'honderd'

  // Long scale with -ard forms
  scaleWords = ['duizend', 'miljoen', 'miljard', 'biljoen', 'biljard', 'triljoen', 'triljard', 'quadriljoen', 'quadriljard']

  constructor (options = {}) {
    super()

    this.setOptions({
      includeOptionalAnd: false,
      noHundredPairing: false,
      accentOne: true
    }, options)
  }

  /**
   * Gets the word for "one" based on accentOne option.
   */
  get oneWord () {
    return this.options.accentOne ? 'één' : 'een'
  }

  /**
   * Converts integer to words with optional hundred pairing for 1100-9999.
   */
  integerToWords (integerPart) {
    // Hundred pairing: 1100-9999 → "elfhonderd vier" style
    if (!this.options.noHundredPairing && integerPart >= 1100n && integerPart < 10000n) {
      const high = integerPart / 100n
      const low = integerPart % 100n

      // Only use pairing when high is not a multiple of 10
      // (e.g., 1104 → elfhonderd vier, but 2000 → tweeduizend)
      if (high % 10n !== 0n) {
        let result = this.segmentToWords(high, 0) + 'honderd'
        if (low > 0n) {
          const lowWords = this.segmentToWords(low, 0)
          if (this.options.includeOptionalAnd && low < 13n) {
            result += ' en ' + this.applyAccentOne(lowWords)
          } else {
            result += ' ' + this.applyAccentOne(lowWords)
          }
        }
        return result
      }
    }

    return super.integerToWords(integerPart)
  }

  /**
   * Applies één/een based on accentOne option.
   */
  applyAccentOne (word) {
    if (this.options.accentOne) {
      return word.replace(/\been\b/g, 'één')
    }
    return word
  }

  /**
   * Converts a 3-digit segment (0-999) to words.
   *
   * Dutch: units come before tens with "en" connector.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds
    if (hundreds > 0n) {
      if (hundreds === 1n) {
        parts.push(this.hundredWord)
      } else {
        parts.push(this.onesWords[hundreds] + this.hundredWord)
      }
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds, nothing more
    } else if (tensOnes < 10n) {
      // Single digit
      parts.push(this.onesWords[ones])
    } else if (tensOnes < 20n) {
      // 10-19: teens
      parts.push(this.teensWords[ones])
    } else {
      // 20-99: Dutch puts ones before tens with connector
      if (ones === 0n) {
        parts.push(this.tensWords[tens])
      } else {
        // Connector: "ën" if ones ends in vowel and tens starts with vowel-ish sound
        // Actually: "ën" if ones word ends in 'e' (twee, drie), else "en"
        const onesWord = this.onesWords[ones]
        const tensWord = this.tensWords[tens]
        const connector = onesWord.endsWith('e') ? 'ën' : 'en'
        parts.push(onesWord + connector + tensWord)
      }
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Combines segment parts with Dutch compound rules.
   * Dutch compounds words without spaces for most things.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''

    // If includeOptionalAnd and segment < 13, we may need "en" prefix
    // But this is handled in joinSegments for post-thousand cases
    // Within a segment, just concatenate
    const ones = segment % 100n

    // For hundreds + remainder: compound without space
    // Unless includeOptionalAnd and remainder < 13
    if (parts.length === 2 && segment >= 100n && ones > 0n && ones < 13n && this.options.includeOptionalAnd) {
      return parts[0] + 'en' + parts[1]
    }

    return parts.join('')
  }

  /**
   * Gets scale word for index with pluralization.
   * Dutch uses simple scale pattern.
   */
  scaleWordForIndex (scaleIndex, segment) {
    const word = this.scaleWords[scaleIndex - 1]
    if (!word) return ''
    return word
  }

  /**
   * Joins segments with Dutch spacing rules.
   * - duizend: compounds with preceding (vijfduizend), space after
   * - miljoen+: space before and after (één miljoen, vier miljoen)
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) {
      return this.applyAccentOne(parts[0])
    }

    const result = []
    const millionPlusScales = this.scaleWords.slice(1) // Everything after 'duizend'

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]
      const prevPart = i > 0 ? parts[i - 1] : null

      // Check scale word types
      const isThousand = part === 'duizend'
      const isMillionPlus = millionPlusScales.includes(part)
      const prevIsThousand = prevPart === 'duizend'
      const prevIsMillionPlus = prevPart && millionPlusScales.includes(prevPart)

      // Skip "een" before duizend (but keep before miljoen+)
      if (part === 'een' && nextPart === 'duizend') {
        continue
      }

      // Determine spacing
      if (i > 0) {
        // Space before million+ scale words
        if (isMillionPlus) {
          result.push(' ')
        } else if (isThousand) {
          // duizend compounds with preceding number (vijfduizend)
          // But space if preceding was a scale word
          if (prevIsMillionPlus) {
            result.push(' ')
          }
          // Otherwise no space (compound)
        } else if (prevIsThousand || prevIsMillionPlus) {
          // Space after scale words (duizend één, miljoen één)
          // But check for includeOptionalAnd
          if (this.options.includeOptionalAnd) {
            const partValue = this.getPartValue(part)
            if (partValue !== null && partValue < 13n) {
              result.push(' en ')
            } else {
              result.push(' ')
            }
          } else {
            result.push(' ')
          }
        }
        // Otherwise compound (no space)
      }

      result.push(part)
    }

    return this.applyAccentOne(result.join(''))
  }

  /**
   * Gets numeric value of a word part (for includeOptionalAnd check).
   */
  getPartValue (part) {
    // Check ones
    for (const [digit, word] of Object.entries(this.onesWords)) {
      if (part === word) return BigInt(digit)
    }
    // Check teens
    for (const [digit, word] of Object.entries(this.teensWords)) {
      if (part === word) return BigInt(10) + BigInt(digit)
    }
    return null
  }
}
