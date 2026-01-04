import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Filipino language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Linker "ng" after vowels: "isang daang" (100), "dalawang libong" (2000)
 * - Linker " na " after consonants: "siyam na daang" (900)
 * - Special tens with linker: "limampung anim" (56)
 * - Per-digit decimal reading
 */
export class Filipino extends ScaleLanguage {
  negativeWord = 'negatibo'
  decimalSeparatorWord = 'punto'
  zeroWord = 'zero'
  usePerDigitDecimals = true

  onesWords = {
    1: 'isa',
    2: 'dalawa',
    3: 'tatlo',
    4: 'apat',
    5: 'lima',
    6: 'anim',
    7: 'pito',
    8: 'walo',
    9: 'siyam'
  }

  teensWords = {
    0: 'sampu',
    1: 'labinisa',
    2: 'labindalawa',
    3: 'labintatlo',
    4: 'labinapat',
    5: 'labinlima',
    6: 'labinanum',
    7: 'labimpito',
    8: 'labingwalo',
    9: 'labinsiyam'
  }

  tensWords = {
    2: 'dalawampu',
    3: 'tatlumpu',
    4: 'apatnapu',
    5: 'limampu',
    6: 'animnapu',
    7: 'pitumpu',
    8: 'walumpu',
    9: 'siyamnapu'
  }

  // Scale words include linker (end with "ng" or " na ")
  hundredWord = 'daang'
  thousandWord = 'libong'

  scaleWords = ['milyong', 'bilyong', 'trilyong']

  /**
   * Adds appropriate linker to a word.
   * - Words ending in vowel get "ng" suffix
   * - Words ending in consonant get " na " suffix
   */
  #addLinker (word) {
    const vowels = ['a', 'e', 'i', 'o', 'u']
    const lastChar = word[word.length - 1]
    if (vowels.includes(lastChar)) {
      return word + 'ng'
    }
    return word + ' na'
  }

  /**
   * Converts a 3-digit segment with Filipino linker rules.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds: "isang daang", "dalawang daang", "siyam na daang"
    if (hundreds > 0n) {
      const hundredPrefix = this.#addLinker(this.onesWords[hundreds])
      parts.push(`${hundredPrefix} ${this.hundredWord}`)
    }

    // Tens and ones
    const tensOnes = segment % 100n

    if (tensOnes === 0n) {
      // Just hundreds
    } else if (tensOnes < 10n) {
      // Single digit
      parts.push(this.onesWords[ones])
    } else if (tensOnes < 20n) {
      // Teens (10-19)
      parts.push(this.teensWords[ones])
    } else if (ones === 0n) {
      // Even tens (20, 30, 40, etc.)
      parts.push(this.tensWords[tens])
    } else {
      // Tens + ones with linker for limampu (50)
      if (tens === 5n) {
        // limampu + ng + ones = "limampung anim"
        parts.push(`${this.tensWords[tens]}ng ${this.onesWords[ones]}`)
      } else {
        // Other tens: space separated
        parts.push(`${this.tensWords[tens]} ${this.onesWords[ones]}`)
      }
    }

    return parts.join(' ')
  }

  /**
   * Gets scale word for index with linker already included.
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    // Index 2 → scaleWords[0] (milyong), etc.
    return this.scaleWords[scaleIndex - 2] || ''
  }

  /**
   * Joins segments with Filipino rules.
   *
   * Multiplier before scale word gets linker: "dalawang libong"
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      const nextPart = parts[i + 1]

      // Add linker to segment if followed by scale word
      if (nextPart && this.#isScaleWord(nextPart)) {
        // Find the last word in the part to add linker
        const words = part.split(' ')
        const lastWord = words[words.length - 1]

        // Check if last word already has linker (ends with "ng" or " na")
        if (!lastWord.endsWith('ng') && !lastWord.endsWith(' na')) {
          words[words.length - 1] = this.#addLinker(lastWord)
          part = words.join(' ')
        }
      }

      result.push(part)

      if (nextPart) {
        result.push(' ')
      }
    }

    return result.join('')
  }

  /**
   * Checks if a word is a scale word.
   */
  #isScaleWord (word) {
    return word === this.hundredWord ||
           word === this.thousandWord ||
           this.scaleWords.includes(word)
  }
}
