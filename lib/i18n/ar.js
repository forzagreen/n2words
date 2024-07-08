import AbstractLanguage from '../classes/abstract-language.js';

/**
 * @augments AbstractLanguage
 */
class Arabic extends AbstractLanguage {
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
      'واحدة',
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
    return this.ones[this.feminine ? 'feminine' : 'masculine'][digit - 1];
  }

  /**
   * Processes the Arabic group number and returns the corresponding Arabic representation.
   * @param {number} groupNumber - The number to process. (Range: 1-999)
   * @param {number} groupLevel - Group level to process. (See example)
   * @returns {string} The Arabic representation of the group number.
   * @example 12345678 is processed in blocks of 3: '678' (group 0), '345' (group 1), '12' (group 2).
   */
  processArabicGroup(groupNumber, groupLevel) {
    let tens = groupNumber % 100;
    const hundreds = groupNumber / 100;
    let returnValue = '';

    if (Math.trunc(hundreds) > 0) {
      if (tens == 0 && Math.trunc(hundreds) == 2) {
        returnValue = this.arabicTwos[0];
      } else {
        returnValue = this.arabicHundreds[Math.trunc(hundreds)];
        if (returnValue != '' && tens != 0) {
          returnValue += ' و';
        }
      }
    }

    if (tens > 0 && tens < 20) { // 1 -> 19
      if (tens === 2 && Math.trunc(hundreds) === 0 && groupLevel > 0) {
        const pow = Math.trunc(Math.log10(Number(this.number)));
        if (pow % 3 === 0 && this.number === 2 * Math.pow(10, pow)) {
          returnValue = groupNumber === 2 ? this.arabicTwos[Math.trunc(groupLevel)] : this.arabicAppendedTwos[Math.trunc(groupLevel)];
        } else {
          returnValue = this.arabicTwos[Math.trunc(groupLevel)];
        }
      } else if (tens === 1 && groupLevel > 0) {
        returnValue += this.arabicGroup[Math.trunc(groupLevel)];
      } else {
        returnValue += this.digitFeminineStatus(Math.trunc(tens), groupLevel);
      }
    } else if (tens >= 20) { // 20 -> 99
      const ones = tens % 10;
      const tensIndex = (tens / 10) - 2;
      if (ones > 0) {
        returnValue += this.digitFeminineStatus(ones, groupLevel);
      }
      if (returnValue != '' && ones != 0) {
        returnValue += ' و';
      }
      returnValue += this.arabicTens[Math.trunc(tensIndex)];
    }

    return returnValue;
  }

  /**
   * Converts a number to its cardinal representation in Arabic.
   * It process by blocks of 3 digits.
   * @param {number} number - The number to convert.
   * @returns {string} The cardinal representation of the number in Arabic.
   */
  toCardinal(number) {
    if (number == 0) {
      return this.zero;
    }

    this.number = number;
    let temporaryNumber = number;
    let temporaryNumberDec;
    let group = 0;
    let returnValue = '';

    // Loop until number has been reduced to zero or less
    while (temporaryNumber > 0) {
      temporaryNumberDec = temporaryNumber;
      // Get the remaining value after dividing by 1000
      const numberToProcess = Number(temporaryNumberDec % 1000n); // Maximum: 999
      temporaryNumber = temporaryNumberDec / 1000n;

      // Process "group"
      const groupDescription = this.processArabicGroup(numberToProcess, group);

      // Did the group return anything?
      if (groupDescription != '') {
        // Is this after the first "group" ? Because nothing is appeded after group 0.
        if (group > 0) { // hundreds, thousands, etc...
          // Is the return value still empty ?
          if (returnValue != '') {
            returnValue = ' و' + returnValue;
          }

          if (numberToProcess > 2) {
            if (numberToProcess % 100 == 1) {
              returnValue = this.arabicGroup[group] + ' ' + returnValue;
            } else {
              if (numberToProcess >= 3 && numberToProcess <= 10) {
                returnValue = this.arabicPluralGroups[group] + ' ' + returnValue;
              } else {
                returnValue = returnValue == '' ? this.arabicGroup[group] + ' ' + returnValue : this.arabicAppendedGroup[group] + ' ' + returnValue;
              }
            }
          }
        }

        // Add "group" return to output variable
        // NOTE: Language is right-to-left
        returnValue = groupDescription + ' ' + returnValue;
      }

      // Increase group level/number
      group++;
    }

    // Replace multiple spaces with one space
    returnValue = returnValue.replaceAll(/ +/g, ' ');

    return returnValue.trim();
  }
}

export default Arabic;
