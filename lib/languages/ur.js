import SouthAsianLanguage from '../classes/south-asian-language.js'

class Urdu extends SouthAsianLanguage {
  negativeWord = 'منفی'
  decimalSeparatorWord = 'اعشاریہ'
  zeroWord = 'صفر'
  hundredWord = 'سو'

  belowHundred = [
    'صفر',
    'ایک',
    'دو',
    'تین',
    'چار',
    'پانچ',
    'چھ',
    'سات',
    'آٹھ',
    'نو',
    'دس',
    'گیارہ',
    'بارہ',
    'تیرہ',
    'چودہ',
    'پندرہ',
    'سولہ',
    'سترہ',
    'اٹھارہ',
    'انیس',
    'بیس',
    'اکیس',
    'بائیس',
    'تیئیس',
    'چوبیس',
    'پچیس',
    'چھبیس',
    'ستائیس',
    'اٹھائیس',
    'انتیس',
    'تیس',
    'اکتیس',
    'بتیس',
    'تینتیس',
    'چونتیس',
    'پینتیس',
    'چھتیس',
    'سینتیس',
    'اڑتیس',
    'انتالیس',
    'چالیس',
    'اکتالیس',
    'بیالیس',
    'تینتالیس',
    'چوالیس',
    'پینتالیس',
    'چھالیس',
    'سینتالیس',
    'اڑتالیس',
    'انچاس',
    'پچاس',
    'اکاون',
    'باون',
    'ترپن',
    'چون',
    'پچپن',
    'چھپن',
    'ستاون',
    'اٹھاون',
    'انسٹھ',
    'ساٹھ',
    'اکسٹھ',
    'باسٹھ',
    'ترسٹھ',
    'چونسٹھ',
    'پینسٹھ',
    'چھیاسٹھ',
    'سڑسٹھ',
    'اڑسٹھ',
    'انہتر',
    'ستر',
    'اکہتر',
    'بہتر',
    'تہتر',
    'چوہتر',
    'پچھتر',
    'چھہتر',
    'ستتر',
    'اٹھہتر',
    'اناسی',
    'اسی',
    'اکیاسی',
    'بیاسی',
    'تریاسی',
    'چوراسی',
    'پچاسی',
    'چھیاسی',
    'ستاسی',
    'اٹھاسی',
    'نواسی',
    'نوے',
    'اکانوے',
    'بانوے',
    'ترانوے',
    'چورانوے',
    'پچانوے',
    'چھیانوے',
    'ستانوے',
    'اٹھانوے',
    'ننانوے'
  ]

  scaleWords = [
    '',
    'ہزار',
    'لاکھ',
    'کروڑ',
    'ارب',
    'کھرب',
    'نیل',
    'پدم',
    'شنکھ'
  ]
}

/**
 * Converts a number to Urdu cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @returns {string} The number expressed in Urdu words.
 * @throws {TypeError} If value is an invalid type.
 * @throws {Error} If value is NaN or an invalid number string.
 * @example
 * convertToWords(123456); // 'ایک لاکھ تیئس ہزار چار سو چھپن'
 * convertToWords(1234567); // 'بارہ لاکھ چونتیس ہزار پانچ سو ستائیس'
 */
export default function convertToWords (value, options = {}) {
  return new Urdu(options).convertToWords(value)
}
