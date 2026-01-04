import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Greek language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Space-separated number composition
 * - Implicit "one" (ένα) omission before scale words
 * - Irregular hundreds (διακόσια, τριακόσια, etc.)
 * - Digit-by-digit decimal reading
 */
export class Greek extends ScaleLanguage {
  negativeWord = 'μείον'
  decimalSeparatorWord = 'κόμμα'
  zeroWord = 'μηδέν'
  usePerDigitDecimals = true

  onesWords = {
    1: 'ένα',
    2: 'δύο',
    3: 'τρία',
    4: 'τέσσερα',
    5: 'πέντε',
    6: 'έξι',
    7: 'επτά',
    8: 'οκτώ',
    9: 'εννέα'
  }

  teensWords = {
    0: 'δέκα',
    1: 'έντεκα',
    2: 'δώδεκα',
    3: 'δεκατρία',
    4: 'δεκατέσσερα',
    5: 'δεκαπέντε',
    6: 'δεκαέξι',
    7: 'δεκαεπτά',
    8: 'δεκαοκτώ',
    9: 'δεκαεννέα'
  }

  tensWords = {
    2: 'είκοσι',
    3: 'τριάντα',
    4: 'σαράντα',
    5: 'πενήντα',
    6: 'εξήντα',
    7: 'εβδομήντα',
    8: 'ογδόντα',
    9: 'ενενήντα'
  }

  // Greek has irregular hundreds
  hundredsWords = {
    1: 'εκατό',
    2: 'διακόσια',
    3: 'τριακόσια',
    4: 'τετρακόσια',
    5: 'πεντακόσια',
    6: 'εξακόσια',
    7: 'επτακόσια',
    8: 'οκτακόσια',
    9: 'εννιακόσια'
  }

  thousandWord = 'χίλια'

  // Short scale
  scaleWords = ['εκατομμύριο', 'δισεκατομμύριο', 'τρισεκατομμύριο']

  /**
   * Joins segments with Greek spacing rules.
   *
   * Key pattern: Omit "ένα" before χίλια and scale words.
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]

      // Skip "ένα" before χίλια or scale words
      if (part === 'ένα' && nextPart &&
          (nextPart === this.thousandWord || this.scaleWords.includes(nextPart))) {
        continue
      }

      result.push(part)

      if (nextPart) {
        result.push(' ')
      }
    }

    return result.join('')
  }

  /**
   * Gets scale word for index.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    // Index 2 → scaleWords[0] (εκατομμύριο), etc.
    return this.scaleWords[scaleIndex - 2] || ''
  }
}
