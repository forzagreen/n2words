import { HebrewLanguage } from '../classes/hebrew-language.js'

/**
 * Modern Hebrew language converter.
 *
 * Supports:
 * - Right-to-left text orientation
 * - Feminine grammatical forms (default in Modern Hebrew)
 * - Dual forms for 2, 200, 2000
 * - Optional "ve" (ו) conjunction via options
 */
export class Hebrew extends HebrewLanguage {
  negativeWord = 'מינוס'
  decimalSeparatorWord = 'נקודה'
  zeroWord = 'אפס'
  usePerDigitDecimals = true

  // Feminine forms (default in Modern Hebrew)
  onesWords = {
    1: 'אחת',
    2: 'שתים',
    3: 'שלש',
    4: 'ארבע',
    5: 'חמש',
    6: 'שש',
    7: 'שבע',
    8: 'שמונה',
    9: 'תשע'
  }

  teensWords = {
    0: 'עשר',
    1: 'אחת עשרה',
    2: 'שתים עשרה',
    3: 'שלש עשרה',
    4: 'ארבע עשרה',
    5: 'חמש עשרה',
    6: 'שש עשרה',
    7: 'שבע עשרה',
    8: 'שמונה עשרה',
    9: 'תשע עשרה'
  }

  twentiesWords = {
    2: 'עשרים',
    3: 'שלשים',
    4: 'ארבעים',
    5: 'חמישים',
    6: 'ששים',
    7: 'שבעים',
    8: 'שמונים',
    9: 'תשעים'
  }

  hundredsWords = {
    1: 'מאה',
    2: 'מאתיים',
    3: 'מאות'
  }

  pluralForms = {
    1: 'אלף',
    2: 'אלפיים',
    3: 'שלשת אלפים',
    4: 'ארבעת אלפים',
    5: 'חמשת אלפים',
    6: 'ששת אלפים',
    7: 'שבעת אלפים',
    8: 'שמונת אלפים',
    9: 'תשעת אלפים'
  }

  scale = {
    1: 'אלף', // thousand (singular)
    2: 'מיליון', // million
    3: 'מיליארד', // billion
    4: 'טריליון', // trillion
    5: 'קוודרליון', // quadrillion
    6: 'קווינטיליון' // quintillion
  }

  scalePlural = {
    1: 'אלפים', // thousands
    2: 'מיליונים', // millions
    3: 'מיליארדים', // billions
    4: 'טריליונים', // trillions
    5: 'קוודרליונים', // quadrillions
    6: 'קווינטיליונים' // quintillions
  }

  constructor (options = {}) {
    super(options)

    this.setOptions({
      andWord: 'ו'
    }, options)
  }
}
