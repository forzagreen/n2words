/**
 * Slavic language utilities
 *
 * Shared helpers for Slavic languages (Serbian, Croatian, etc.)
 * These are pure functions - no state, no vocab, just logic.
 */

/**
 * Slavic three-form pluralization.
 *
 * Works with Russian, Ukrainian, Serbian, Croatian, and similar languages.
 * NOT compatible with Polish/Czech (which use different rules for 21, 101, etc.)
 *
 * @param {number|bigint} n - The segment value (0-999). BigInt is converted to Number.
 * @param {string[]} forms - [singular, few, many]
 * @returns {string} The appropriate form
 *
 * Rules:
 * - Singular: ends in 1 (except 11-19)
 * - Few: ends in 2-4 (except 12-14)
 * - Many: everything else (0, 5-9, 10-19)
 */
export function pluralize (n, forms) {
  // Convert BigInt to Number (safe for segments 0-999)
  const num = typeof n === 'bigint' ? Number(n) : n

  const lastDigit = num % 10
  const lastTwoDigits = num % 100

  // Teens (11-19) always use "many" form
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return forms[2]
  }

  if (lastDigit === 1) return forms[0]
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1]
  return forms[2]
}

/**
 * Builds a segment word (0-999) for Slavic languages.
 *
 * @param {number} n - Number 0-999
 * @param {boolean} feminine - Use feminine forms for ones
 * @param {Object} vocab - Vocabulary object
 * @param {string[]} vocab.onesMasc - Masculine ones ['', 'jedan', ...]
 * @param {string[]} vocab.onesFem - Feminine ones ['', 'jedna', ...]
 * @param {string[]} vocab.teens - Teens ['deset', 'jedanaest', ...]
 * @param {string[]} vocab.tens - Tens ['', '', 'dvadeset', ...]
 * @param {string[]} vocab.hundreds - Hundreds ['', 'sto', 'dvesta', ...]
 * @returns {string} The segment in words
 */
export function buildSegment (n, feminine, vocab) {
  if (n === 0) return ''

  const ones = n % 10
  const tensDigit = Math.floor(n / 10) % 10
  const hundredsDigit = Math.floor(n / 100)

  const parts = []

  if (hundredsDigit > 0) {
    parts.push(vocab.hundreds[hundredsDigit])
  }

  if (tensDigit > 1) {
    parts.push(vocab.tens[tensDigit])
  }

  if (tensDigit === 1) {
    parts.push(vocab.teens[ones])
  } else if (ones > 0) {
    const onesArr = feminine ? vocab.onesFem : vocab.onesMasc
    parts.push(onesArr[ones])
  }

  return parts.join(' ')
}

/**
 * Precomputes all segment words (0-999) for both genders.
 *
 * @param {Object} vocab - Vocabulary object
 * @returns {{ masc: string[], fem: string[] }} Precomputed segments
 */
export function buildAllSegments (vocab) {
  const masc = new Array(1000)
  const fem = new Array(1000)

  for (let i = 0; i < 1000; i++) {
    masc[i] = buildSegment(i, false, vocab)
    fem[i] = buildSegment(i, true, vocab)
  }

  return { masc, fem }
}
