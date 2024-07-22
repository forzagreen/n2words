import AbstractLanguage from '../classes/abstract-language.js';

/**
 * @augments AbstractLanguage
 */
export class Persian extends AbstractLanguage {
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
    1_000_000: 'میلیون',
  };

  constructor(options) {
    options = Object.assign({
      negativeWord: 'منفى',
      separatorWord: 'ممیّز',
      zero: 'صفر'
    }, options);

    super(options);
  }

  toCardinal(number) {
    if (this.namedNumbers[number]) {
      return this.namedNumbers[number];
    }

    if (number > 20n && number < 100n) {
      let xone = number % 10n;
      let xten = number - xone;
      return `${this.namedNumbers[xten]} و ${this.namedNumbers[xone]}`;
    }

    if (number > 100n && number < 1000n) {
      let xhundred = 100n * (number / 100n);
      let tail = this.toCardinal(number - xhundred);
      return `${this.namedNumbers[xhundred]} و ${tail}`;
    }

    if (number > 1000n && number < 1_000_000n) {
      let thousandMultiplier = number / 1000n;
      let namedThousandMultiplier =
        (thousandMultiplier == 1n
          ? ''
          : this.toCardinal(thousandMultiplier)) +
        ' ' +
        this.namedNumbers[1000];
      let tailNumber = number - thousandMultiplier * 1000n;
      let tail = tailNumber == 0n ? '' : ' ' + this.toCardinal(tailNumber);
      return `${namedThousandMultiplier}${tail}`;
    }

    if (number > 1_000_000n) {
      let millionMultiplier = number / 1_000_000n;
      let namedMillion =
        this.toCardinal(millionMultiplier) + ' ' + this.namedNumbers[1_000_000];
      let tailNumber = number - millionMultiplier * 1_000_000n;
      let tail = tailNumber == 0n ? '' : ' و ' + this.toCardinal(tailNumber);
      return `${namedMillion}${tail}`;
    }
  }
}

export default Persian;
