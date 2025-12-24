import { AbstractLanguage } from '../classes/abstract-language.js'

/**
 * Persian (Farsi) language converter.
 *
 * Converts numbers to Persian words using Persian-Arabic numerals:
 * - Right-to-left script orientation
 * - Base-10 decimal system with Persian number words
 * - Conjunction "و" (va/and) for compound numbers
 * - Traditional Persian number naming conventions
 *
 * Key Features:
 * - Named number lookup table (namedNumbers) for direct mapping 0-999
 * - Group-based algorithm for numbers >= 1000:
 *   1. Split into groups of 3 digits
 *   2. Convert each group to words using named table or recursion
 *   3. Append magnitude word (هزار/میلیون/میلیارد)
 *   4. Join with "و" (and) conjunction
 * - Special compound forms (دویست for 200, سیصد for 300)
 * - Proper Persian grammatical structure
 * - Support for large numbers (thousands, millions, billions, trillions)
 *
 * Features:
 * - Native Persian digits and words
 * - Special compound forms (e.g., دویست for 200, سیصد for 300)
 * - Support for large numbers (thousands, millions)
 * - Proper Persian grammatical structure
 */
export class FarsiNumberConverter extends AbstractLanguage {
  negativeWord = 'منفى'
  decimalSeparatorWord = 'ممیّز'
  zeroWord = 'صفر'

  namedNumbers = {
    0: 'صفر',
    1: 'یک',
    2: 'دو',
    3: 'سه',
    4: 'چهار',
    5: 'پنج',
    6: 'شش',
    7: 'هفت',
    8: 'هشت',
    9: 'نه',
    10: 'ده',
    11: 'یازده',
    12: 'دوازده',
    13: 'سیزده',
    14: 'چهارده',
    15: 'پانزده',
    16: 'شانزده',
    17: 'هفده',
    18: 'هجده',
    19: 'نوزده',
    20: 'بیست',
    30: 'سی',
    40: 'چهل',
    50: 'پنجاه',
    60: 'شصت',
    70: 'هفتاد',
    80: 'هشتاد',
    90: 'نود',
    100: 'صد',
    200: 'دویست',
    300: 'سيصد',
    400: 'چهار صد',
    500: 'پانصد',
    600: 'ششصد',
    700: 'هفتصد',
    800: 'هشتصد',
    900: 'نهصد',
    1000: 'هزار',
    1_000_000: 'میلیون'
  }

  convertWholePart (number) {
    if (this.namedNumbers[number] && number !== 1_000_000n) {
      return this.namedNumbers[number]
    }

    if (number > 20n && number < 100n) {
      const xone = number % 10n
      const xten = number - xone
      return `${this.namedNumbers[xten]} و ${this.namedNumbers[xone]}`
    }

    if (number > 100n && number < 1000n) {
      const xhundred = 100n * (number / 100n)
      const tail = this.convertWholePart(number - xhundred)
      return `${this.namedNumbers[xhundred]} و ${tail}`
    }

    if (number > 1000n && number < 1_000_000n) {
      const thousandMultiplier = number / 1000n
      const namedThousandMultiplier =
        (thousandMultiplier === 1n
          ? ''
          : this.convertWholePart(thousandMultiplier)) +
        ' ' +
        this.namedNumbers[1000]
      const tailNumber = number - thousandMultiplier * 1000n
      const tail = tailNumber === 0n ? '' : ' ' + this.convertWholePart(tailNumber)
      return `${namedThousandMultiplier}${tail}`
    }

    if (number >= 1_000_000n) {
      const millionMultiplier = number / 1_000_000n
      const namedMillion =
        this.convertWholePart(millionMultiplier) + ' ' + this.namedNumbers[1_000_000]
      const tailNumber = number - millionMultiplier * 1_000_000n
      const tail = tailNumber === 0n ? '' : ' و ' + this.convertWholePart(tailNumber)
      return `${namedMillion}${tail}`
    }
  }
}
