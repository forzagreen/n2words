import AbstractLanguage from '../classes/AbstractLanguage.mjs';

export class Arabic extends AbstractLanguage {
  constructor(options) {
    super(Object.assign({
      negativeWord: 'ناقص',
      separatorWord: 'فاصلة',
      zero: 'صفر'
    }, options));

    this.integerValue = 0;
    this.decimalValue = 0;
    this.number = 0;
    // this.isCurrencyPartNameFeminine = true
    // this.isCurrencyNameFeminine = false
    this.arabicOnes = [
      '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية',
      'تسعة',
      'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
      'ستة عشر', 'سبعة عشر', 'ثمانية عشر',
      'تسعة عشر',
    ];
    this.arabicFeminineOnes = [
      '', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان',
      'تسع',
      'عشر', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة',
      'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة',
      'تسع عشرة',
    ];
    this.arabicTens = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    this.arabicHundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    this.arabicAppendedTwos = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا'];
    this.arabicTwos = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان'];
    this.arabicGroup = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون'];
    this.arabicAppendedGroup = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً'];
    this.arabicPluralGroups = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات'];
  }

  digitFeminineStatus(digit/* , groupLevel */) {
    // if ((groupLevel == -1 && this.isCurrencyPartNameFeminine) || (groupLevel == 0 && this.isCurrencyNameFeminine)) {
    //   return this.arabicFeminineOnes[parseInt(digit)]
    // }
    return this.arabicOnes[parseInt(digit)];
  }

  processArabicGroup(groupNumber, groupLevel, remainingNumber) {
    let tens = groupNumber % 100;
    const hundreds = groupNumber / 100;
    let retVal = '';
    if (parseInt(hundreds) > 0) {
      retVal = (
        tens == 0 && parseInt(hundreds) == 2
      ) ? this.arabicAppendedTwos[0] : this.arabicHundreds[parseInt(hundreds)];
    }
    if (tens > 0) {
      if (tens < 20) {
        if (tens == 2 && parseInt(hundreds) == 0 && groupLevel > 0) {
          retVal = ([
            2000, 2000000, 2000000000, 2000000000000, 2000000000000000, 2000000000000000000
          ].indexOf(this.integerValue) != -1) ? this.arabicAppendedTwos[
              parseInt(groupLevel)] : this.arabicTwos[parseInt(groupLevel)
            ];
        } else {
          if (retVal != '') {
            retVal += ' و ';
          }
          if (tens == 1 && groupLevel > 0 && hundreds == 0) {
            retVal += '';
          } else if (
            (tens == 1 || tens == 2) && (groupLevel == 0 || groupLevel == -1) &&
            (hundreds == 0 && remainingNumber == 0)
          ) {
            retVal += '';
          } else {
            retVal += this.digitFeminineStatus(parseInt(tens), groupLevel);
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
        retVal += this.arabicTens[parseInt(tens)];
      }
    }
    return retVal;
  }

  toCardinal(number) {
    /** @todo Convert class to work with BigInt */
    number = Number(number);

    if (number == 0) {
      return this.zero;
    }
    let tempNumber = number;
    this.integerValue = number;
    let retVal = '';
    let group = 0;
    while (tempNumber > 0) {
      const numberToProcess = parseInt(tempNumber % 1000);
      tempNumber = parseInt(tempNumber / 1000);
      const groupDescription = this.processArabicGroup(numberToProcess, group, Math.floor(tempNumber));
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
      group += 1;
    }
    return retVal.trim();
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string} value Number to be convert.
 * @throws {Error} Value cannot be invalid.
 * @returns {string} Value in cardinal (written) format.
 */
export default function(value) {
  return new Arabic().floatToCardinal(value);
}
