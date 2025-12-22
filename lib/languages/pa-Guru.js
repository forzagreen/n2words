import SouthAsianLanguage from '../classes/south-asian-language.js'

class Punjabi extends SouthAsianLanguage {
  negativeWord = 'ਮਾਇਨਸ'
  decimalSeparatorWord = 'ਦਸ਼ਮਲਵ'
  zeroWord = 'ਸਿਫ਼ਰ'
  hundredWord = 'ਸੌ'

  belowHundred = [
    'ਸਿਫ਼ਰ',
    'ਇੱਕ',
    'ਦੋ',
    'ਤਿੰਨ',
    'ਚਾਰ',
    'ਪੰਜ',
    'ਛੇ',
    'ਸੱਤ',
    'ਅੱਠ',
    'ਨੌਂ',
    'ਦੱਸ',
    'ਗਿਆਰਾਂ',
    'ਬਾਰਾਂ',
    'ਤੇਰਾਂ',
    'ਚੌਦਾਂ',
    'ਪੰਦਰਾਂ',
    'ਸੋਲਾਂ',
    'ਸਤਾਰਾਂ',
    'ਅਠਾਰਾਂ',
    'ਉੱਨੀ',
    'ਵੀਹ',
    'ਇੱਕੀ',
    'ਬਾਈ',
    'ਤੇਈ',
    'ਚੌਬੀ',
    'ਪੱਚੀ',
    'ਛੱਬੀ',
    'ਸਤਾਈ',
    'ਅਠਾਈ',
    'ਉਨੱਤੀ',
    'ਤੀਹ',
    'ਇਕੱਤੀ',
    'ਬੱਤੀ',
    'ਤੇਤੀ',
    'ਚੌਂਤੀ',
    'ਪੈਂਤੀ',
    'ਛੱਤੀ',
    'ਸੈਂਤੀ',
    'ਅਠੱਤੀ',
    'ਉਨਤਾਲੀ',
    'ਚਾਲੀ',
    'ਇਕਤਾਲੀ',
    'ਬਿਆਲੀ',
    'ਤਿਰਤਾਲੀ',
    'ਚੁਵਾਲੀ',
    'ਪੰਤਾਲੀ',
    'ਛਿਆਲੀ',
    'ਸੈਂਤਾਲੀ',
    'ਅਠਤਾਲੀ',
    'ਉਨੰਜਾ',
    'ਪੰਜਾਹ',
    'ਇਕਵੰਜਾ',
    'ਬਵੰਜਾ',
    'ਤਰਵੰਜਾ',
    'ਚੁਰਵੰਜਾ',
    'ਪੰਜਵੰਜਾ',
    'ਛਪੰਜਾ',
    'ਸੱਤਵੰਜਾ',
    'ਅਠਵੰਜਾ',
    'ਉਨਾਹਠ',
    'ਸੱਠ',
    'ਇਕਾਹਠ',
    'ਬਾਹਠ',
    'ਤਰਸਠ',
    'ਚੌਂਸਠ',
    'ਪੈਂਸਠ',
    'ਛਿਆਸਠ',
    'ਸੜਸਠ',
    'ਅੜਸਠ',
    'ਉਣਹੱਤਰ',
    'ਸਤੱਰ',
    'ਇਕਹੱਤਰ',
    'ਬਹੱਤਰ',
    'ਤਹੱਤਰ',
    'ਚੌਹੱਤਰ',
    'ਪੰਝਹੱਤਰ',
    'ਛਿਹੱਤਰ',
    'ਸਤੱਤਰ',
    'ਅਠੱਤਰ',
    'ਉਨਾਸੀ',
    'ਅੱਸੀ',
    'ਇਕਿਆਸੀ',
    'ਬਿਆਸੀ',
    'ਤਰਿਆਸੀ',
    'ਚੌਰਿਆਸੀ',
    'ਪਚਾਸੀ',
    'ਛਿਆਸੀ',
    'ਸੱਤਾਸੀ',
    'ਅਠਾਸੀ',
    'ਨਵਾਸੀ',
    'ਨੱਬੇ',
    'ਇਕਾਨਵੇਂ',
    'ਬਾਨਵੇਂ',
    'ਤਰਾਨਵੇਂ',
    'ਚੁਰਾਨਵੇਂ',
    'ਪੰਚਾਨਵੇਂ',
    'ਛਿਆਨਵੇਂ',
    'ਸਤਾਨਵੇਂ',
    'ਅਠਾਨਵੇਂ',
    'ਨਿਨਾਨਵੇਂ'
  ]

  scaleWords = [
    '',
    'ਹਜ਼ਾਰ',
    'ਲੱਖ',
    'ਕਰੋੜ',
    'ਅਰਬ',
    'ਖਰਬ',
    'ਨੀਲ',
    'ਪਦਮ',
    'ਸ਼ੰਖ'
  ]
}

/**
 * Converts a number to Punjabi cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @returns {string} The number expressed in Punjabi words.
 * @throws {TypeError} If value is an invalid type.
 * @throws {Error} If value is NaN or an invalid number string.
 * @example
 * convertToWords(42); // 'ਬਿਆਲੀ ਦੋ'
 * convertToWords(1000); // 'ਹਜ਼ਾਰ'
 * convertToWords(100000); // 'ਇਕ ਲੱਖ'
 */
export default function convertToWords (value, options = {}) {
  return new Punjabi(options).convertToWords(value)
}
