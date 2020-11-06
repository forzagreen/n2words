export default function () {
  this.namedNumbers = {
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
    1000000: 'میلیون',
  };

  this.toCardinal = (number) => {
    if (this.namedNumbers[number]) {
      return this.namedNumbers[number];
    }
    if (number > 20 && number < 100) {
      let xone = number % 10;
      let xten = number - xone;
      return `${this.namedNumbers[xten]} و ${this.namedNumbers[xone]}`;
    }
    if (number > 100 && number < 1000) {
      let xhundred = 100 * parseInt(number / 100);
      let tail = this.toCardinal(number - xhundred);
      return `${this.namedNumbers[xhundred]} و ${tail}`;
    }
    if (number > 1000 && number < 1000000) {
      let thousand_multiplier = parseInt(number / 1000);
      let named_thousand_multiplier =
        (thousand_multiplier === 1
          ? ''
          : this.toCardinal(thousand_multiplier)) +
        ' ' +
        this.namedNumbers[1000];
      let tail_number = number - thousand_multiplier * 1000;
      let tail = tail_number === 0 ? '' : ' ' + this.toCardinal(tail_number);
      return `${named_thousand_multiplier}${tail}`;
    }
    if (number > 1000000) {
      let million_multiplier = parseInt(number / 1000000);
      let named_million =
        this.toCardinal(million_multiplier) + ' ' + this.namedNumbers[1000000];
      let tail_number = number - million_multiplier * 1000000;
      let tail = tail_number === 0 ? '' : ' و ' + this.toCardinal(tail_number);
      return `${named_million}${tail}`;
    }
  };
  return this.toCardinal();
}
