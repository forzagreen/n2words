import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * (European) Portuguese language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Compound scale numbering (bilião = 10^12, mil milhões = 10^9)
 * - Gender-aware hundreds (duzentos, trezentos, etc.)
 * - "e" (and) conjunction for number combinations
 * - Scale word pluralization (milhão→milhões, bilião→biliões)
 * - Special handling for "cem" vs "cento"
 * - Numbers up to quadrillions
 *
 * Compound scale: milhão (10^6), mil milhões (10^9), bilião (10^12),
 *                 mil biliões (10^15), trilião (10^18), etc.
 */
export class Portuguese extends ScaleLanguage {
  negativeWord = 'menos'
  decimalSeparatorWord = 'vírgula'
  zeroWord = 'zero'

  onesWords = {
    1: 'um',
    2: 'dois',
    3: 'três',
    4: 'quatro',
    5: 'cinco',
    6: 'seis',
    7: 'sete',
    8: 'oito',
    9: 'nove'
  }

  teensWords = {
    0: 'dez',
    1: 'onze',
    2: 'doze',
    3: 'treze',
    4: 'catorze',
    5: 'quinze',
    6: 'dezasseis',
    7: 'dezassete',
    8: 'dezoito',
    9: 'dezanove'
  }

  tensWords = {
    2: 'vinte',
    3: 'trinta',
    4: 'quarenta',
    5: 'cinquenta',
    6: 'sessenta',
    7: 'setenta',
    8: 'oitenta',
    9: 'noventa'
  }

  // Portuguese has irregular hundreds
  hundredsWords = {
    1: 'cento',
    2: 'duzentos',
    3: 'trezentos',
    4: 'quatrocentos',
    5: 'quinhentos',
    6: 'seiscentos',
    7: 'setecentos',
    8: 'oitocentos',
    9: 'novecentos'
  }

  // Compound scale configuration
  scaleMode = 'compound'
  thousandWord = 'mil'
  scaleWords = ['milhão', 'bilião', 'trilião', 'quatrilião']

  /**
   * Pluralizes Portuguese scale words (ão → ões).
   */
  pluralizeScaleWord (word) {
    return word.replace('ão', 'ões')
  }

  /**
   * Combines segment parts with Portuguese "e" rules.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''

    // For exact hundreds (100, 200, etc.), no "e" needed
    if (segment % 100n === 0n) {
      return parts[0]
    }

    // For hundreds + remainder, join with " e "
    if (segment >= 100n) {
      const tensOnesParts = parts.slice(1)
      // Tens + ones also get " e "
      const tensOnesPart = tensOnesParts.join(' e ')
      return `${parts[0]} e ${tensOnesPart}`
    }

    // For just tens + ones, join with " e "
    return parts.join(' e ')
  }

  /**
   * Converts segment with special handling for exact 100 and "um" omission.
   */
  segmentToWords (segment, scaleIndex) {
    // Exact 100 is "cem", not "cento"
    if (segment === 100n) {
      return 'cem'
    }

    // For segment=1 before thousands (index 1) or "mil X" scales (odd indices), omit "um"
    if (segment === 1n && (scaleIndex === 1 || scaleIndex % 2 === 1)) {
      return ''
    }

    return super.segmentToWords(segment, scaleIndex)
  }

  /**
   * Join segments with "e" before final small segment when needed.
   *
   * Portuguese uses "e" before the final segment if:
   * - The final segment is < 100
   * - There's a scale word before it
   *
   * But NOT between scale words and hundreds (e.g., "mil cento" not "mil e cento")
   */
  joinSegments (parts, integerPart) {
    if (parts.length <= 1) return parts.join(' ')

    // Check if we need to insert "e" before the final segment
    const lastPart = parts[parts.length - 1]
    const secondLastPart = parts[parts.length - 2]

    // Check if second-to-last ends with a scale word
    const isSecondLastScale = secondLastPart === 'mil' ||
      secondLastPart.endsWith('milhão') || secondLastPart.endsWith('milhões') ||
      secondLastPart.endsWith('bilião') || secondLastPart.endsWith('biliões') ||
      secondLastPart.endsWith('trilião') || secondLastPart.endsWith('triliões') ||
      secondLastPart.endsWith('quatrilião') || secondLastPart.endsWith('quatriliões')

    // Check if last part starts with a hundreds word (cento, duzentos, etc.)
    const lastStartsWithHundreds = Object.values(this.hundredsWords).some(h =>
      lastPart.startsWith(h)
    ) || lastPart === 'cem'

    if (isSecondLastScale && !lastStartsWithHundreds) {
      const result = [...parts]
      result.splice(parts.length - 1, 0, 'e')
      return result.join(' ')
    }

    return parts.join(' ')
  }
}
