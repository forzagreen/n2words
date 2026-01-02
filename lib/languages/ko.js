import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Korean language converter.
 *
 * Supports:
 * - Hangul numerals (일, 이, 삼, etc.)
 * - Grouping by 만 (10,000) system
 * - Implicit '일' (one) omission before multipliers
 */
export class Korean extends GreedyScaleLanguage {
  negativeWord = '마이너스'
  decimalSeparatorWord = '점'
  zeroWord = '영'

  scaleWords = [
    [10_000_000_000_000_000_000_000_000_000n, '양'],
    [1_000_000_000_000_000_000_000_000n, '자'],
    [100_000_000_000_000_000_000n, '해'],
    [10_000_000_000_000_000n, '경'],
    [1_000_000_000_000n, '조'],
    [100_000_000n, '억'],
    [10_000n, '만'],
    [1000n, '천'],
    [100n, '백'],
    [10n, '십'],
    [9n, '구'],
    [8n, '팔'],
    [7n, '칠'],
    [6n, '육'],
    [5n, '오'],
    [4n, '사'],
    [3n, '삼'],
    [2n, '이'],
    [1n, '일'],
    [0n, '영']
  ]

  /** Combines two word-sets according to Korean grammar rules. */
  combineWordSets (preceding, following) {
    const precedingWord = Object.keys(preceding)[0]
    const followingWord = Object.keys(following)[0]
    const precedingValue = Object.values(preceding)[0] // BigInt
    const followingValue = Object.values(following)[0] // BigInt

    // Implicit "일": omit 1 before multipliers up to 만 (10,000)
    if (precedingValue === 1n && followingValue <= 10_000n) return following
    // Concatenate (no space) for small numbers less than 만
    if (precedingValue < 10_000n && precedingValue > followingValue) return { [`${precedingWord}${followingWord}`]: precedingValue + followingValue }
    // Space-separate for large numbers (>= 만) when adding
    if (precedingValue >= 10_000n && precedingValue > followingValue) return { [`${precedingWord} ${followingWord}`]: precedingValue + followingValue }
    // Multiply for all scale combinations
    return { [`${precedingWord}${followingWord}`]: precedingValue * followingValue }
  }
}
