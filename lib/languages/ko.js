import { MyriadLanguage } from '../classes/myriad-language.js'

/**
 * Korean language converter.
 *
 * Uses myriad-based (만) grouping for high performance.
 * Supports:
 * - Hangul numerals (일, 이, 삼, etc.)
 * - Grouping by 만 (10,000) system
 * - Implicit '일' (one) omission before scale words ≤ 만
 * - Space separation after 만+ scales
 *
 * Korean number system:
 * - Groups by 4 digits (만-based)
 * - 만 (man) = 10,000
 * - 억 (eok) = 100,000,000 = 만 × 만
 * - 조 (jo) = 1,000,000,000,000
 * - 경 (gyeong) = 10^16
 */
export class Korean extends MyriadLanguage {
  negativeWord = '마이너스'
  decimalSeparatorWord = '점'
  zeroWord = '영'

  onesWords = {
    1: '일',
    2: '이',
    3: '삼',
    4: '사',
    5: '오',
    6: '육',
    7: '칠',
    8: '팔',
    9: '구'
  }

  tenWord = '십'
  hundredWord = '백'
  thousandWord = '천'

  // Myriad scale words (powers of 10,000)
  scaleWords = ['만', '억', '조', '경', '해', '자', '양']

  /**
   * Converts a digit to words with Korean implicit "일" rules.
   *
   * Korean omits "일" (one) before:
   * - 십 (ten), 백 (hundred), 천 (thousand) within a segment
   * - All scale words (만, 억, 조, etc.)
   */
  digitToWords (digit, position, scaleIndex) {
    // Omit "일" (one) before internal scale words
    if (digit === 1n) {
      return ''
    }
    return this.onesWords[digit]
  }

  /**
   * Converts a 4-digit segment with Korean implicit "일" rules.
   *
   * Korean omits the entire segment word when it's just "일" (one)
   * before any scale word (만, 억, 조, etc.).
   */
  segmentToWords (segment, scaleIndex) {
    // Implicit "일": omit segment when it's 1 and followed by a scale word
    if (segment === 1n && scaleIndex > 0) {
      return ''
    }
    return super.segmentToWords(segment, scaleIndex)
  }

  /**
   * Joins segments with Korean spacing rules.
   *
   * - Within a segment (below 만): concatenate without spaces
   * - After 만+ scale words: add space before next segment
   */
  joinSegments (parts, integerPart) {
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]

    const result = []
    const isScaleWord = (part) => this.scaleWords.includes(part)

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const prevPart = i > 0 ? parts[i - 1] : null

      // Add space after scale words (before the next number)
      if (i > 0 && prevPart && isScaleWord(prevPart) && !isScaleWord(part)) {
        result.push(' ')
      }

      result.push(part)
    }

    return result.join('')
  }

  /**
   * Converts number to words with Korean spacing rules.
   *
   * Korean uses:
   * - No spaces within integer parts (unless after scale words)
   * - Spaces between decimal components (점, individual digits/numbers)
   */
  toWords (isNegative, integerPart, decimalPart) {
    const words = []

    if (isNegative) words.push(this.negativeWord)

    words.push(this.integerToWords(integerPart))

    if (decimalPart) {
      words.push(this.decimalSeparatorWord)
      words.push(...this.decimalDigitsToWords(decimalPart))
    }

    // Use space separator for final join (decimals need spaces)
    return words.join(' ')
  }
}
