import AbstractLanguage from '../classes/AbstractLanguage.js';

export class Arabic extends AbstractLanguage {
  number;

  feminine;

  ones = {
    masculine: [
      'واحد',
      'اثنان',
      'ثلاثة',
      'أربعة',
      'خمسة',
      'ستة',
      'سبعة',
      'ثمانية',
      'تسعة',
      'عشرة',
      'أحد عشر',
      'اثنا عشر',
      'ثلاثة عشر',
      'أربعة عشر',
      'خمسة عشر',
      'ستة عشر',
      'سبعة عشر',
      'ثمانية عشر',
      'تسعة عشر',
    ],
    feminine: [
      'إحدى',
      'اثنتان',
      'ثلاث',
      'أربع',
      'خمس',
      'ست',
      'سبع',
      'ثمان',
      'تسع',
      'عشر',
      'إحدى عشرة',
      'اثنتا عشرة',
      'ثلاث عشرة',
      'أربع عشرة',
      'خمس عشرة',
      'ست عشرة',
      'سبع عشرة',
      'ثماني عشرة',
      'تسع عشرة',
    ]
  };

  arabicTens = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

  arabicHundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  arabicAppendedTwos = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا'];

  arabicTwos = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان'];

  arabicGroup = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون'];

  arabicAppendedGroup = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً'];

  arabicPluralGroups = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات'];

  // isCurrencyPartNameFeminine = true

  // isCurrencyNameFeminine = false

  constructor(options) {
    options = Object.assign({
      negativeWord: 'ناقص',
      separatorWord: 'فاصلة',
      zero: 'صفر',
      feminine: false,
    }, options);

    super(options);

    this.feminine = options.feminine;
  }

  digitFeminineStatus(digit) {
    // if ((groupLevel == -1 && this.isCurrencyPartNameFeminine) || (groupLevel == 0 && this.isCurrencyNameFeminine)) {
    //   return this.arabicFeminineOnes[digit]
    // }
    return this.ones[this.feminine ? 'feminine' : 'masculine'][digit - 1];
  }

  processArabicGroup(groupNumber, groupLevel, remainingNumber) {
    let tens = groupNumber % 100;
    const hundreds = groupNumber / 100;
    let retVal = '';

    if (hundreds > 0) {
      retVal = (tens == 0 && Math.trunc(hundreds) == 2 ? this.arabicAppendedTwos[0] : this.arabicHundreds[Math.trunc(hundreds)]);
    }

    if (tens > 0) {
      if (tens < 20) {
        if (tens == 2 && Math.trunc(hundreds) == 0 && groupLevel > 0) {
          retVal = ([
            2000, 2000000, 2000000000, 2000000000000, 2000000000000000, 2000000000000000000
          ].indexOf(this.number) != -1) ? this.arabicAppendedTwos[groupLevel] : this.arabicTwos[groupLevel];
        } else {
          // Add divider
          if (retVal != '') {
            retVal += ' و ';
          }

          if (tens == 1 && groupLevel > 0 && hundreds == 0) {
            retVal += '';
          } else if (
            (tens == 1 || tens == 2) &&
            (groupLevel == 0 || groupLevel == -1) &&
            (hundreds == 0 && remainingNumber == 0)
          ) {
            retVal += '';
          } else {
            retVal += this.digitFeminineStatus(Math.trunc(tens), groupLevel);
          }
        }
      } else {
        const ones = tens % 10;
        tens = (tens / 10) - 2;

        if (ones > 0) {
          if (retVal != '' && tens < 4) {
            retVal += ' و ';
          }

          retVal += this.digitFeminineStatus(ones, groupLevel);
        }
        if (retVal != '' && ones != 0) {
          retVal += ' و ';
        }

        retVal += this.arabicTens[Math.trunc(tens)];
      }
    }

    return retVal;
  }

  toCardinal(number) {
    if (number == 0) {
      return this.zero;
    }

    this.number = number;
    let tempNumber = number;
    let group = 0;
    let retVal = '';

    while (tempNumber > 0) {
      const numberToProcess = Number(tempNumber % 1000n); // Maximum: 807
      tempNumber = tempNumber / 1000n;

      const groupDescription = this.processArabicGroup(numberToProcess, group, tempNumber);

      if (groupDescription != '') {
        if (group > 0) {
          if (retVal != '') {
            retVal = ' و ' + retVal;
          }

          if (numberToProcess != 2) {
            if (numberToProcess % 100 != 1) {
              if (numberToProcess >= 3 && numberToProcess <= 10) {
                retVal = this.arabicPluralGroups[group] + ' ' + retVal;
              } else {
                if (retVal != '') {
                  retVal = this.arabicAppendedGroup[group] + ' ' + retVal;
                } else {
                  retVal = this.arabicGroup[group] + ' ' + retVal;
                }
              }
            } else {
              retVal = this.arabicGroup[group] + ' ' + retVal;
            }
          }
        }

        retVal = groupDescription + ' ' + retVal;
      }

      group++;
    }

    return retVal.trim();
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @param {object} [options] Options for class.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function (value, options = {}) {
  return new Arabic(options).floatToCardinal(value);
}
