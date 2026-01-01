import { SlavicLanguage } from '../classes/slavic-language.js'

/**
 * Biblical Hebrew language converter.
 *
 * Supports:
 * - Three-form pluralization (one/few/many)
 * - Gender agreement (masculine/feminine)
 * - Optional "ו" (and) conjunction control
 */
export class BiblicalHebrew extends SlavicLanguage {
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

  /** Converts whole number with Biblical Hebrew three-form pluralization. */
  integerToWords (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    const words = []
    const chunks = this.splitIntoChunks(number.toString(), 3)
    let index = chunks.length
    for (const x of chunks) {
      index = index - 1
      if (x === 0n) {
        continue
      }

      const [n1, n2, n3] = this.extractDigits(x)

      if (index > 0) {
        // For thousands and above, handle the full chunk value
        const chunkWords = []
        let hasHundreds = false

        // Process hundreds in this chunk
        if (n3 > 0n) {
          hasHundreds = true
          if (n3 <= 2n) {
            chunkWords.push(this.hundredsWords[n3])
          } else {
            chunkWords.push(this.onesWords[n3] + ' ' + this.hundredsWords[3])
          }
        }

        // Process tens in this chunk
        if (n2 > 1n) {
          // Add conjunction if there were hundreds before
          const tensWord = this.twentiesWords[n2]
          chunkWords.push(hasHundreds ? this.options.andWord + tensWord : tensWord)
        }

        // Process ones in this chunk
        if (n2 === 1n) {
          // Add conjunction if there were hundreds before
          const onesWord = this.teensWords[n1]
          chunkWords.push(hasHundreds ? this.options.andWord + onesWord : onesWord)
        } else if (n1 > 0n) {
          // For "one million", "one billion", etc., don't add the word "one"
          if (x === 1n && index > 1) {
            // Skip adding "one" for millions/billions/etc.
          } else if (x <= 9n && chunkWords.length === 0 && index === 1) {
            // Use special forms for 1-9 thousand
            chunkWords.push(this.pluralForms[n1])
          } else {
            const onesWord = this.onesWords[n1]
            // Add conjunction if there were hundreds or tens before
            chunkWords.push((hasHundreds || n2 > 0n) ? this.options.andWord + onesWord : onesWord)
          }
        }

        // Add scale word (thousand, million, billion, etc.)
        if (x > 9n || index > 1) {
          // For numbers > 9 or higher scales, use appropriate scale word
          if (x === 1n) {
            // Singular form (e.g., "one thousand", "one million")
            chunkWords.push(this.scale[index])
          } else if (x === 2n && index === 1) {
            // Special dual form for "two thousand" (already in thousands[2])
            return [this.pluralForms[2], ...words].join(' ')
          } else if (x === 2n) {
            // For two million, two billion, etc. - use plural form
            chunkWords.push(this.scalePlural[index])
          } else if (index === 1) {
            // For thousands (10+), always use singular "אלף"
            chunkWords.push(this.scale[index])
          } else {
            // For millions/billions/etc. use plural form
            chunkWords.push(this.scalePlural[index])
          }
        }

        words.push(chunkWords.join(' '))
        continue
      }

      if (n3 > 0n) {
        if (n3 <= 2n) {
          words.push(this.hundredsWords[n3])
        } else {
          words.push(this.onesWords[n3] + ' ' + this.hundredsWords[3])
        }
      }

      if (n2 > 1n) {
        words.push(this.twentiesWords[n2])
      }

      if (n2 === 1n) {
        words.push(this.teensWords[n1])
      } else if (n1 > 0n) {
        words.push(this.onesWords[n1])
      }
    }

    if (words.length > 1) {
      words[words.length - 1] = this.options.andWord + words.at(-1)
    }

    return words.join(' ')
  }
}
