import { InflectedScaleLanguage } from '../classes/inflected-scale-language.js'

/**
 * Latvian language converter.
 *
 * Supports:
 * - Two-form pluralization (singular for 1, plural for rest)
 * - Latvian diacritical marks (ī, ā, ē, ū)
 * - Compound number formation (divdesmit, trīsdesmit)
 * - Special hundreds forms (simts/simti/simtu)
 */
export class Latvian extends InflectedScaleLanguage {
  negativeWord = 'mīnus'
  decimalSeparatorWord = 'komats'
  zeroWord = 'nulle'

  onesWords = {
    1: 'viens',
    2: 'divi',
    3: 'trīs',
    4: 'četri',
    5: 'pieci',
    6: 'seši',
    7: 'septiņi',
    8: 'astoņi',
    9: 'deviņi'
  }

  onesFeminineWords = {
    1: 'viena',
    2: 'divas',
    3: 'trīs',
    4: 'četras',
    5: 'piecas',
    6: 'sešas',
    7: 'septiņas',
    8: 'astoņas',
    9: 'deviņas'
  }

  teensWords = {
    0: 'desmit',
    1: 'vienpadsmit',
    2: 'divpadsmit',
    3: 'trīspadsmit',
    4: 'četrpadsmit',
    5: 'piecpadsmit',
    6: 'sešpadsmit',
    7: 'septiņpadsmit',
    8: 'astoņpadsmit',
    9: 'deviņpadsmit'
  }

  tensWords = {
    2: 'divdesmit',
    3: 'trīsdesmit',
    4: 'četrdesmit',
    5: 'piecdesmit',
    6: 'sešdesmit',
    7: 'septiņdesmit',
    8: 'astoņdesmit',
    9: 'deviņdesmit'
  }

  /**
   * Latvian hundreds have three forms:
   * - simts (singular: 100, 101-199 when alone)
   * - simti (plural: 200-999)
   * - simtu (genitive: 101-109 when followed by ones)
   */
  hundredsForms = ['simts', 'simti', 'simtu']

  pluralForms = {
    1: ['tūkstotis', 'tūkstoši', 'tūkstošu'],
    2: ['miljons', 'miljoni', 'miljonu'],
    3: ['miljards', 'miljardi', 'miljardu'],
    4: ['triljons', 'triljoni', 'triljonu'],
    5: ['kvadriljons', 'kvadriljoni', 'kvadriljonu'],
    6: ['kvintiljons', 'kvintiljoni', 'kvintiljonu'],
    7: ['sikstiljons', 'sikstiljoni', 'sikstiljonu'],
    8: ['septiljons', 'septiljoni', 'septiljonu'],
    9: ['oktiljons', 'oktiljoni', 'oktiljonu'],
    10: ['nontiljons', 'nontiljoni', 'nontiljonu']
  }

  /**
   * Latvian omits "one" before scale words.
   * e.g., 1000 is "tūkstotis" not "viens tūkstotis"
   */
  omitOneBeforeScale = true

  /**
   * Converts a 3-digit segment to words.
   * Handles Latvian-specific hundreds forms.
   *
   * @protected
   * @param {bigint} segment The segment value (0-999).
   * @param {number} scaleIndex The scale level.
   * @returns {string} The segment in words.
   */
  segmentToWords (segment, scaleIndex) {
    if (segment === 0n) return ''

    const ones = segment % 10n
    const tens = (segment / 10n) % 10n
    const hundreds = (segment / 100n) % 10n
    const parts = []

    // Hundreds - Latvian has special forms
    if (hundreds > 0n) {
      if (hundreds === 1n && tens === 0n && ones > 0n) {
        // 101-109: use genitive form "simtu"
        parts.push(this.hundredsForms[2])
      } else if (hundreds > 1n) {
        // 200-999: use plural "simti"
        parts.push(this.onesWords[hundreds], this.hundredsForms[1])
      } else {
        // 100, 110-199: use singular "simts"
        parts.push(this.hundredsForms[0])
      }
    }

    // Tens
    if (tens > 1n) {
      parts.push(this.tensWords[tens])
    }

    // Teens or ones
    if (tens === 1n) {
      parts.push(this.teensWords[ones])
    } else if (ones > 0n) {
      // Skip "one" before scale words if omitOneBeforeScale is set
      const shouldOmitOne = this.omitOneBeforeScale && scaleIndex > 0 && segment === 1n

      if (!shouldOmitOne) {
        parts.push(this.onesWords[ones])
      }
    }

    return parts.join(' ')
  }

  /**
   * Latvian uses simpler pluralization than Slavic languages.
   * Only two effective forms: singular (ends in 1, except 11) and plural.
   *
   * @param {bigint} n The number to check.
   * @param {string[]} forms Array of [singular, plural, genitive] forms.
   * @returns {string} The appropriate form for the number.
   */
  pluralize (n, forms) {
    if (n === 0n) {
      return forms[2]
    }

    const lastDigit = n % 10n
    const lastTwoDigits = n % 100n

    if (lastDigit === 1n && lastTwoDigits !== 11n) {
      return forms[0]
    }

    return forms[1]
  }
}
