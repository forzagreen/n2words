import { ScaleLanguage } from '../classes/scale-language.js'

/**
 * Danish language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Vigesimal (base-20) tens naming: halvtreds (50), treds (60), halvfjerds (70), firs (80), halvfems (90)
 * - Units-before-tens reversal: "enogtyve" (21) = one-and-twenty
 * - Compound thousands: "ettusind", "firetusinde" (digit + tusind, no space)
 * - "og" (and) conjunction after hundreds and thousands
 * - Long scale for millions+: millioner, millarder, billioner, etc.
 *
 * Danish treats thousands as compound words (like hundreds) but millions+ as separate.
 */
export class Danish extends ScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'komma'
  zeroWord = 'nul'

  onesWords = {
    1: 'et',
    2: 'to',
    3: 'tre',
    4: 'fire',
    5: 'fem',
    6: 'seks',
    7: 'syv',
    8: 'otte',
    9: 'ni'
  }

  // "en" form used in vigesimal pattern and before millions
  onesWordsVigesimal = {
    1: 'en',
    2: 'to',
    3: 'tre',
    4: 'fire',
    5: 'fem',
    6: 'seks',
    7: 'syv',
    8: 'otte',
    9: 'ni'
  }

  teensWords = {
    0: 'ti',
    1: 'elleve',
    2: 'tolv',
    3: 'tretten',
    4: 'fjorten',
    5: 'femten',
    6: 'seksten',
    7: 'sytten',
    8: 'atten',
    9: 'nitten'
  }

  // Danish vigesimal tens (base-20 derived names)
  tensWords = {
    2: 'tyve',
    3: 'tredive',
    4: 'fyrre',
    5: 'halvtreds',
    6: 'treds',
    7: 'halvfjerds',
    8: 'firs',
    9: 'halvfems'
  }

  // Hundreds use digit words directly (compound: "to" + "hundrede" = "tohundrede")
  hundredsWords = {
    1: 'et',
    2: 'to',
    3: 'tre',
    4: 'fire',
    5: 'fem',
    6: 'seks',
    7: 'syv',
    8: 'otte',
    9: 'ni'
  }

  hundredWord = 'hundrede'
  thousandWord = 'tusind'

  // Long scale: millioner (10^6), millarder (10^9), billioner (10^12), etc.
  scaleWords = ['millioner', 'millarder', 'billioner', 'billarder', 'trillioner', 'trillarder', 'quadrillioner', 'quadrillarder']

  /**
   * Converts a 3-digit segment with Danish vigesimal pattern.
   *
   * Danish units-before-tens: 21 = "enogtyve" (one-and-twenty)
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds: "ethundrede", "tohundrede", etc. (no space)
    if (hundreds > 0n) {
      parts.push(`${this.hundredsWords[hundreds]}${this.hundredWord}`)
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
      // Units-before-tens: "enogtyve", "treogfyrre"
      const onesWord = this.onesWordsVigesimal[ones]
      const tensWord = this.tensWords[tens]
      parts.push(`${onesWord}og${tensWord}`)
    }

    return this.combineSegmentParts(parts, segment, scaleIndex)
  }

  /**
   * Combines segment parts with Danish "og" rules.
   */
  combineSegmentParts (parts, segment, scaleIndex) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]
    return parts.join(' og ')
  }

  /**
   * Gets scale word for index.
   *
   * Index 1 = thousand (handled specially in joinSegments)
   * Index 2+ = direct lookup in scaleWords array
   */
  scaleWordForIndex (scaleIndex, segment) {
    if (scaleIndex === 1) {
      return this.thousandWord
    }
    // Index 2 → scaleWords[0] (millioner), etc.
    return this.scaleWords[scaleIndex - 2] || ''
  }

  /**
   * Joins segments with Danish compound thousands and spacing rules.
   *
   * Key patterns:
   * - Thousands are compound: "ettusind", "firetusinde"
   * - Thousands + remainder uses "e" suffix: "ettusinde og tre"
   * - Millions+ are space-separated: "en millioner"
   * - "en" (not "et") before millions+
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []
    const isMillionPlus = (word) => {
      for (const sw of this.scaleWords) {
        if (word === sw) return true
      }
      return false
    }

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      const nextPart = parts[i + 1]
      const prevPart = i > 0 ? parts[i - 1] : null

      // Handle "et" → "en" before millions+
      if (part === 'et' && nextPart && isMillionPlus(nextPart)) {
        part = 'en'
      }

      // Compound thousands: merge segment word with "tusind"
      if (nextPart === this.thousandWord) {
        // Merge: "fire" + "tusind" → "firetusind"
        result.push(part + nextPart)
        i++ // Skip the thousand word
        // Check if there's more after
        const afterThousand = parts[i + 1]
        if (afterThousand) {
          // Add 'e' suffix and " og ": "firetusinde og ..."
          result[result.length - 1] += 'e'
          result.push(' og ')
        }
        continue
      }

      // After million+ scale words, use space or " og " for remainder
      if (prevPart && isMillionPlus(prevPart)) {
        if (!isMillionPlus(part) && part !== this.thousandWord) {
          result.push(' ')
        }
      }

      result.push(part)

      // Separator after current part
      if (nextPart && !isMillionPlus(nextPart) && nextPart !== this.thousandWord) {
        // Space before scale words, otherwise continue
        if (isMillionPlus(part)) {
          // After million word: space (handled above)
        }
      } else if (nextPart && isMillionPlus(nextPart)) {
        result.push(' ')
      }
    }

    return result.join('')
  }
}
