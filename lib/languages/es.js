import { CompoundScaleLanguage } from '../classes/compound-scale-language.js'

/**
 * Spanish language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Gender agreement (masculine/feminine via gender option)
 * - "y" conjunction between tens and units
 * - Special hundred forms (cien/ciento, quinientos, setecientos, novecientos)
 * - Long scale compound: millón (10^6), mil millones (10^9), billón (10^12)
 * - Scale pluralization (millón→millones, billón→billones)
 */
export class Spanish extends CompoundScaleLanguage {
  negativeWord = 'menos'
  decimalSeparatorWord = 'punto'
  zeroWord = 'cero'

  onesWords = {
    1: 'uno',
    2: 'dos',
    3: 'tres',
    4: 'cuatro',
    5: 'cinco',
    6: 'seis',
    7: 'siete',
    8: 'ocho',
    9: 'nueve'
  }

  // Feminine forms
  onesWordsFeminine = {
    1: 'una',
    2: 'dos',
    3: 'tres',
    4: 'cuatro',
    5: 'cinco',
    6: 'seis',
    7: 'siete',
    8: 'ocho',
    9: 'nueve'
  }

  teensWords = {
    0: 'diez',
    1: 'once',
    2: 'doce',
    3: 'trece',
    4: 'catorce',
    5: 'quince',
    6: 'dieciseis',
    7: 'diecisiete',
    8: 'dieciocho',
    9: 'diecinueve'
  }

  // 20-29 have special forms
  twentiesWords = {
    0: 'veinte',
    1: 'veintiuno',
    2: 'veintidós',
    3: 'veintitrés',
    4: 'veinticuatro',
    5: 'veinticinco',
    6: 'veintiséis',
    7: 'veintisiete',
    8: 'veintiocho',
    9: 'veintinueve'
  }

  twentiesWordsFeminine = {
    0: 'veinte',
    1: 'veintiuna',
    2: 'veintidós',
    3: 'veintitrés',
    4: 'veinticuatro',
    5: 'veinticinco',
    6: 'veintiséis',
    7: 'veintisiete',
    8: 'veintiocho',
    9: 'veintinueve'
  }

  tensWords = {
    3: 'treinta',
    4: 'cuarenta',
    5: 'cincuenta',
    6: 'sesenta',
    7: 'setenta',
    8: 'ochenta',
    9: 'noventa'
  }

  // Masculine hundreds
  hundredsWords = {
    1: 'ciento', // becomes "cien" when alone
    2: 'doscientos',
    3: 'trescientos',
    4: 'cuatrocientos',
    5: 'quinientos', // irregular (not "cinco cientos")
    6: 'seiscientos',
    7: 'setecientos', // irregular (not "siete cientos")
    8: 'ochocientos',
    9: 'novecientos' // irregular (not "nueve cientos")
  }

  // Feminine hundreds
  hundredsWordsFeminine = {
    1: 'cienta', // becomes "cien" when alone (no gender on cien)
    2: 'doscientas',
    3: 'trescientas',
    4: 'cuatrocientas',
    5: 'quinientas',
    6: 'seiscientas',
    7: 'setecientas',
    8: 'ochocientas',
    9: 'novecientas'
  }

  // Long scale compound configuration
  thousandWord = 'mil'
  scaleWords = ['millón', 'billón', 'trillón', 'cuatrillón']

  constructor (options = {}) {
    super()

    this.setOptions({
      gender: 'masculine'
    }, options)
  }

  /**
   * Pluralizes Spanish scale words (ón → ones).
   */
  pluralizeScaleWord (word) {
    return word.replace('ón', 'ones')
  }

  /**
   * Converts a 3-digit segment (0-999) to words.
   *
   * Spanish: "y" only between tens and units (30-99 range).
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []
    const isFeminine = this.options.gender === 'feminine'

    // Hundreds
    if (hundreds > 0n) {
      parts.push(this.hundredsToWords(hundreds, scaleIndex, segment))
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds, nothing more
    } else if (tensOnes < 10n) {
      // Single digit
      const onesDict = isFeminine ? this.onesWordsFeminine : this.onesWords
      parts.push(onesDict[ones])
    } else if (tensOnes < 20n) {
      // 10-19: teens
      parts.push(this.teensWords[ones])
    } else if (tensOnes < 30n) {
      // 20-29: special twenties forms
      const twentiesDict = isFeminine ? this.twentiesWordsFeminine : this.twentiesWords
      parts.push(twentiesDict[ones])
    } else {
      // 30-99: tens y ones
      if (ones === 0n) {
        parts.push(this.tensWords[tens])
      } else {
        const onesDict = isFeminine ? this.onesWordsFeminine : this.onesWords
        parts.push(`${this.tensWords[tens]} y ${onesDict[ones]}`)
      }
    }

    return parts.join(' ')
  }

  /**
   * Converts hundreds digit to words with Spanish rules.
   * - "cien" when exactly 100
   * - "ciento/cienta" when followed by more
   * - Gender agreement for 200-900
   */
  hundredsToWords (hundreds, scaleIndex, segment) {
    const remainder = segment % 100n
    const isFeminine = this.options.gender === 'feminine'

    if (hundreds === 1n) {
      // 100 exactly = "cien" (no gender)
      // 101-199 = "ciento" (masc) or "cienta" (fem)
      if (remainder === 0n) {
        return 'cien'
      }
      return isFeminine ? 'cienta' : 'ciento'
    }

    // 200-900: use gendered forms
    const hundredsDict = isFeminine ? this.hundredsWordsFeminine : this.hundredsWords
    return hundredsDict[hundreds]
  }

  /**
   * Joins segments with Spanish rules.
   * - Omit "uno" before mil (whether mil is alone or followed by millón+)
   * - Use "un" before millón+
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    // Process parts
    const filtered = []
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      const nextPart = parts[i + 1]

      // Skip "uno/una" if followed by "mil" or "mil X" (compound scale)
      // This handles both "mil" alone (1000) and "mil millones" (1000000000)
      if ((part === 'uno' || part === 'una') && nextPart && (nextPart === 'mil' || nextPart.startsWith('mil '))) {
        continue
      }

      // Change "uno" to "un" if followed by millón+
      if (part === 'uno' && nextPart && this.scaleWords.some(sw =>
        nextPart === sw || nextPart === this.pluralizeScaleWord(sw)
      )) {
        part = 'un'
      }

      filtered.push(part)
    }

    return filtered.join(' ')
  }
}
