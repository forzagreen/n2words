import { HebrewLanguage } from '../classes/hebrew-language.js'

/**
 * Biblical Hebrew language converter.
 *
 * Supports:
 * - Dual forms for 2, 200, 2000
 * - Gender agreement (masculine default, feminine via option)
 * - Optional "ו" (and) conjunction control
 */
export class BiblicalHebrew extends HebrewLanguage {
  negativeWord = 'מינוס'
  decimalSeparatorWord = 'נקודה'
  zeroWord = 'אפס'
  usePerDigitDecimals = true

  // Biblical Hebrew (masculine forms as default - historically accurate)
  onesWords = {
    1: 'אחד',
    2: 'שניים',
    3: 'שלשה',
    4: 'ארבעה',
    5: 'חמשה',
    6: 'ששה',
    7: 'שבעה',
    8: 'שמונה',
    9: 'תשעה'
  }

  teensWords = {
    0: 'עשרה',
    1: 'אחד עשר',
    2: 'שנים עשר',
    3: 'שלשה עשר',
    4: 'ארבעה עשר',
    5: 'חמשה עשר',
    6: 'ששה עשר',
    7: 'שבעה עשר',
    8: 'שמונה עשר',
    9: 'תשעה עשר'
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
    3: 'שלשה אלפים',
    4: 'ארבעה אלפים',
    5: 'חמשה אלפים',
    6: 'ששה אלפים',
    7: 'שבעה אלפים',
    8: 'שמונה אלפים',
    9: 'תשעה אלפים'
  }

  // Feminine forms for thousands (when feminine=true is specified)
  femininePluralForms = {
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

  // Feminine forms (for when gender='feminine' is specified)
  onesFeminineWords = {
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

  teensFeminineWords = {
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

  constructor (options = {}) {
    super(options)

    this.setOptions({
      andWord: 'ו',
      gender: 'masculine'
    }, options)

    if (this.options.gender === 'feminine') {
      this.onesWords = this.onesFeminineWords
      this.teensWords = this.teensFeminineWords
      this.pluralForms = this.femininePluralForms
    }
  }
}
