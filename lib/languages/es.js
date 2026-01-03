import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Spanish language converter.
 *
 * Supports:
 * - Gender agreement (masculine/feminine via genderStem option)
 * - "y" conjunction between tens and units
 * - Special hundred forms (cien/ciento)
 */
export class Spanish extends GreedyScaleLanguage {
  negativeWord = 'menos'
  decimalSeparatorWord = 'punto'
  zeroWord = 'cero'

  scaleWords = [
    [1_000_000_000_000_000_000_000_000n, 'cuatrillón'],
    [1_000_000_000_000_000_000n, 'trillón'],
    [1_000_000_000_000n, 'billón'],
    [1_000_000n, 'millón'],
    [1000n, 'mil'],
    [100n, 'cien'],
    [90n, 'noventa'],
    [80n, 'ochenta'],
    [70n, 'setenta'],
    [60n, 'sesenta'],
    [50n, 'cincuenta'],
    [40n, 'cuarenta'],
    [30n, 'treinta'],
    [29n, 'veintinueve'],
    [28n, 'veintiocho'],
    [27n, 'veintisiete'],
    [26n, 'veintiséis'],
    [25n, 'veinticinco'],
    [24n, 'veinticuatro'],
    [23n, 'veintitrés'],
    [22n, 'veintidós'],
    [21n, 'veintiuno'],
    [20n, 'veinte'],
    [19n, 'diecinueve'],
    [18n, 'dieciocho'],
    [17n, 'diecisiete'],
    [16n, 'dieciseis'],
    [15n, 'quince'],
    [14n, 'catorce'],
    [13n, 'trece'],
    [12n, 'doce'],
    [11n, 'once'],
    [10n, 'diez'],
    [9n, 'nueve'],
    [8n, 'ocho'],
    [7n, 'siete'],
    [6n, 'seis'],
    [5n, 'cinco'],
    [4n, 'cuatro'],
    [3n, 'tres'],
    [2n, 'dos'],
    [1n, 'uno'],
    [0n, 'cero']
  ]

  constructor (options = {}) {
    super()

    this.setOptions({
      gender: 'masculine'
    }, options)

    // Apply gender agreement to scale words if feminine
    if (this.options.gender === 'feminine') {
      this.scaleWords = this.scaleWords.map(([value, word]) => {
        if (word === 'veintiuno') return [value, 'veintiuna']
        if (word === 'uno') return [value, 'una']
        return [value, word]
      })
    }
  }

  /** Combines two word-sets with Spanish gender and conjunction rules. */
  combineWordSets (preceding, following) {
    let [[precedingWord, precedingValue]] = Object.entries(preceding)
    let [[followingWord, followingValue]] = Object.entries(following)
    const genderStem = this.options.gender === 'feminine' ? 'a' : 'o'

    if (precedingValue === 1n) {
      if (followingValue < 1_000_000n) return following
      precedingWord = 'un'
    } else if (precedingValue === 100n && followingValue % 1000n !== 0n) {
      precedingWord += 't' + genderStem
    }

    if (followingValue < precedingValue) {
      if (precedingValue < 100n) {
        return { [`${precedingWord} y ${followingWord}`]: precedingValue + followingValue }
      }
      return { [`${precedingWord} ${followingWord}`]: precedingValue + followingValue }
    }

    if (followingValue % 1_000_000n === 0n && precedingValue > 1n) {
      followingWord = followingWord.slice(0, -3) + 'lones'
    }

    if (followingValue === 100n) {
      if (precedingValue === 5n) {
        precedingWord = 'quinien'
        followingWord = ''
      } else if (precedingValue === 7n) {
        precedingWord = 'sete'
      } else if (precedingValue === 9n) {
        precedingWord = 'nove'
      }
      followingWord += 't' + genderStem + 's'
    } else {
      followingWord = ' ' + followingWord
    }

    return { [`${precedingWord}${followingWord}`]: precedingValue * followingValue }
  }
}
