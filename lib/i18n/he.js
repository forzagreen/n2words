import SlavicLanguage from '../classes/slavic-language.js'

/**
 * Hebrew language converter.
 *
 * Implements Hebrew number words using the Slavic language pattern:
 * - Hebrew alphabet and right-to-left text
 * - Hebrew number words (אחת, שתים, שלוש, ארבע...)
 * - Feminine number forms (default in Hebrew)
 * - Optional "ve" (ו, "and") conjunction between number groups
 *
 * Key Features:
 * - Three-form pluralization system shared across Slavic languages
 *   * Form 1 (singular): 1 (e.g., "אלף")
 *   * Form 2 (few): 2-4, 22-24, 32-34... excluding teens (e.g., "אלפים")
 *   * Form 3 (many): all other numbers (e.g., "אלף")
 * - Chunk-based decomposition (splits into groups of 3 digits: ones, thousands, millions, etc.)
 * - Large number handling via thousands[] array with indexed [singular, few, many] forms
 *
 * Features:
 * - Right-to-left text orientation
 * - Feminine grammatical gender for numbers
 * - Three-form pluralization (similar to Slavic pattern)
 * - Conjunction control via "and" option
 *
 * Inherits from SlavicLanguage for complex pluralization algorithms.
 */
export class Hebrew extends SlavicLanguage {
  negativeWord = 'מינוס'

  zeroWord = 'אפס'

  // Modern Hebrew (feminine forms)
  ones = {
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

  tens = {
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

  twenties = {
    2: 'עשרים',
    3: 'שלשים',
    4: 'ארבעים',
    5: 'חמישים',
    6: 'ששים',
    7: 'שבעים',
    8: 'שמונים',
    9: 'תשעים'
  }

  hundreds = {
    1: 'מאה',
    2: 'מאתיים',
    3: 'מאות'
  }

  thousands = {
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

  // Biblical Hebrew (masculine forms)
  biblicalOnes = {
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

  biblicalTens = {
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

  biblicalTwenties = {
    2: 'עשרים',
    3: 'שלשים',
    4: 'ארבעים',
    5: 'חמישים',
    6: 'ששים',
    7: 'שבעים',
    8: 'שמונים',
    9: 'תשעים'
  }

  biblicalHundreds = {
    1: 'מאה',
    2: 'מאתיים',
    3: 'מאות'
  }

  biblicalThousands = {
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

  biblicalScale = {
    1: 'אלף',
    2: 'מיליון',
    3: 'מיליארד',
    4: 'טריליון',
    5: 'קוודרליון',
    6: 'קווינטיליון'
  }

  biblicalScalePlural = {
    1: 'אלפים',
    2: 'מיליונים',
    3: 'מיליארדים',
    4: 'טריליונים',
    5: 'קוודרליונים',
    6: 'קווינטיליונים'
  }

  /**
   * Initializes the Hebrew converter with language-specific options.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {string} [options.and='ו'] Conjunction character (typically 'ו' for and).
   * @param {boolean} [options.biblical=false] Use biblical scale words instead of modern ones.
   * @param {boolean} [options.feminine=false] Use feminine forms for numbers.
   */
  constructor ({ and = 'ו', biblical = false, feminine = false } = {}) {
    super({ feminine })

    this.and = and
    this.feminine = feminine

    this.biblical = biblical
    if (this.biblical) {
      this.ones = this.biblicalOnes
      this.tens = this.biblicalTens
      this.twenties = this.biblicalTwenties
      this.hundreds = this.biblicalHundreds
      this.thousands = this.biblicalThousands
      this.scale = this.biblicalScale
      this.scalePlural = this.biblicalScalePlural
    }
  }

  convertWholePart (number) {
    if (number === 0n) {
      return this.zeroWord
    }
    const words = []
    const chunks = this.splitByX(number.toString(), 3)
    let index = chunks.length
    for (const x of chunks) {
      index = index - 1
      if (x === 0n) {
        continue
      }

      const [n1, n2, n3] = this.getDigits(x)

      if (index > 0) {
        // For thousands and above, handle the full chunk value
        const chunkWords = []
        let hasHundreds = false

        // Process hundreds in this chunk
        if (n3 > 0n) {
          hasHundreds = true
          if (n3 <= 2n) {
            chunkWords.push(this.hundreds[n3])
          } else {
            chunkWords.push(this.ones[n3] + ' ' + this.hundreds[3])
          }
        }

        // Process tens in this chunk
        if (n2 > 1n) {
          // Add conjunction if there were hundreds before
          const tensWord = this.twenties[n2]
          chunkWords.push(hasHundreds ? this.and + tensWord : tensWord)
        }

        // Process ones in this chunk
        if (n2 === 1n) {
          // Add conjunction if there were hundreds before
          const onesWord = this.tens[n1]
          chunkWords.push(hasHundreds ? this.and + onesWord : onesWord)
        } else if (n1 > 0n) {
          // For "one million", "one billion", etc., don't add the word "one"
          if (x === 1n && index > 1) {
            // Skip adding "one" for millions/billions/etc.
          } else if (x <= 9n && chunkWords.length === 0 && index === 1) {
            // Use special forms for 1-9 thousand
            chunkWords.push(this.thousands[n1])
          } else {
            // Add the ones word
            const onesWord = this.ones[n1]
            // Add conjunction if there were hundreds or tens before
            chunkWords.push((hasHundreds || n2 > 0n) ? this.and + onesWord : onesWord)
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
            // Replace the word we added
            return [this.thousands[2], ...words].join(' ')
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
          words.push(this.hundreds[n3])
        } else {
          words.push(this.ones[n3] + ' ' + this.hundreds[3])
        }
      }

      if (n2 > 1n) {
        words.push(this.twenties[n2])
      }

      if (n2 === 1n) {
        words.push(this.tens[n1])
      } else if (n1 > 0n) {
        words.push(this.ones[n1])
      }
    }

    if (words.length > 1) {
      words[words.length - 1] = this.and + words.at(-1)
    }

    return words.join(' ')
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function convertToWords (value, options = {}) {
  return new Hebrew(options).convertToWords(value)
}
