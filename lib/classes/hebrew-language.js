import { AbstractLanguage } from './abstract-language.js'

/**
 * Base class for Hebrew language family converters.
 *
 * This class provides shared logic for Modern Hebrew and Biblical Hebrew:
 * - Segment-based number decomposition (3-digit groupings)
 * - Hebrew-specific scale word handling (dual forms, special 1-9 thousands)
 * - Conjunction (ו) insertion rules
 * - Right-to-left text orientation support
 *
 * Used by: Hebrew (he), Biblical Hebrew (hbo)
 *
 * Subclasses MUST define these properties with language-specific vocabulary:
 * - `onesWords` - Object mapping 1-9 to cardinal forms
 * - `teensWords` - Object mapping 0-9 to teen numbers (10-19)
 * - `twentiesWords` - Object mapping 2-9 to tens (20-90)
 * - `hundredsWords` - Object mapping 1-3 (100, 200, "hundreds" word)
 * - `pluralForms` - Object mapping 1-9 to special thousands forms
 * - `scale` - Object mapping indices to singular scale words
 * - `scalePlural` - Object mapping indices to plural scale words
 *
 * @abstract
 * @extends AbstractLanguage
 */
export class HebrewLanguage extends AbstractLanguage {
  // ============================================================================
  // Required Properties (subclasses must define)
  // ============================================================================

  /**
   * Cardinal forms for digits 1-9.
   * @type {Object.<number, string>}
   */
  onesWords = {}

  /**
   * Words for teen numbers (10-19).
   * Index 0 is the word for 10.
   * @type {Object.<number, string>}
   */
  teensWords = {}

  /**
   * Words for multiples of ten (20-90).
   * @type {Object.<number, string>}
   */
  twentiesWords = {}

  /**
   * Words for hundreds.
   * Key 1: 100 (מאה), Key 2: 200 dual (מאתיים), Key 3: "hundreds" word (מאות)
   * @type {Object.<number, string>}
   */
  hundredsWords = {}

  /**
   * Special forms for 1-9 thousand in construct state.
   * @type {Object.<number, string>}
   */
  pluralForms = {}

  /**
   * Singular scale words (thousand, million, billion, etc.).
   * @type {Object.<number, string>}
   */
  scale = {}

  /**
   * Plural scale words (thousands, millions, billions, etc.).
   * @type {Object.<number, string>}
   */
  scalePlural = {}

  // ============================================================================
  // Constructor
  // ============================================================================

  /**
   * Constructs a HebrewLanguage instance with optional configuration.
   *
   * @param {Object} [options] Configuration options.
   * @param {string} [options.andWord='ו'] Conjunction character.
   */
  constructor (options = {}) {
    super()

    this.setOptions({
      andWord: 'ו'
    }, options)
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Converts an integer to its Hebrew word representation.
   *
   * Hebrew number construction algorithm:
   * 1. Split number into 3-digit segments from right to left
   * 2. For each segment, process hundreds, tens, ones with conjunction rules
   * 3. Handle special cases: dual forms (2000), 1-9 thousands, scale words
   * 4. Add conjunction (ו) before final component
   *
   * @param {bigint} integerPart The integer to convert (non-negative).
   * @returns {string} The number in Hebrew words.
   */
  integerToWords (integerPart) {
    if (integerPart === 0n) {
      return this.zeroWord
    }

    const words = []
    const segments = this.splitToSegments(integerPart.toString(), 3)
    let index = segments.length

    for (const x of segments) {
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

      // Process ones segment (no scale word)
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

    // Add conjunction before final component
    if (words.length > 1) {
      words[words.length - 1] = this.options.andWord + words.at(-1)
    }

    return words.join(' ')
  }

  // ============================================================================
  // Protected Methods
  // ============================================================================

  /**
   * Splits a number string into segments of specified size from right to left.
   *
   * Example: splitToSegments('1234567', 3) => [1n, 234n, 567n]
   * This represents: 1 million + 234 thousand + 567 ones
   *
   * @protected
   * @param {string} numberString The number as a string.
   * @param {number} segmentSize Segment size (typically 3 for thousands grouping).
   * @returns {bigint[]} Array of BigInt segments from highest to lowest scale.
   */
  splitToSegments (numberString, segmentSize) {
    const segments = []
    const stringLength = numberString.length

    if (stringLength > segmentSize) {
      const remainderLength = stringLength % segmentSize

      if (remainderLength > 0) {
        segments.push(BigInt(numberString.slice(0, remainderLength)))
      }

      for (let i = remainderLength; i < stringLength; i += segmentSize) {
        segments.push(BigInt(numberString.slice(i, i + segmentSize)))
      }
    } else {
      segments.push(BigInt(numberString))
    }

    return segments
  }

  /**
   * Extracts individual digits from a number (units, tens, hundreds).
   *
   * Returns digits in reverse order: [ones, tens, hundreds]
   * Example: 456 => [6n, 5n, 4n]
   *
   * @protected
   * @param {bigint} value The number to extract digits from (0-999).
   * @returns {bigint[]} Array of [ones, tens, hundreds] as BigInts.
   */
  extractDigits (value) {
    const onesPlace = value % 10n
    const tensPlace = (value / 10n) % 10n
    const hundredsPlace = value / 100n
    return [onesPlace, tensPlace, hundredsPlace]
  }
}
