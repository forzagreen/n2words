/**
 * Converts numbers to their word representation in Kannada (ಕನ್ನಡ).
 * @module languages/kn
 */

import SouthAsianLanguage from '../classes/south-asian-language.js'

/**
 * Kannada language implementation using Indian-style number grouping.
 * @extends SouthAsianLanguage
 */
class KannadaLanguage extends SouthAsianLanguage {
  negativeWord = 'ಋಣಾತ್ಮಕ'
  decimalSeparatorWord = 'ದಶಮಾಂಶ'
  zeroWord = 'ಸೊನ್ನೆ'
  hundredWord = 'ನೂರು'
  convertDecimalsPerDigit = true

  belowHundred = [
    'ಸೊನ್ನೆ', 'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು', 'ಏಳು', 'ಎಂಟು', 'ಒಂಬತ್ತು',
    'ಹತ್ತು', 'ಹನ್ನೊಂದು', 'ಹನ್ನೆರಡು', 'ಹದಿಮೂರು', 'ಹದಿನಾಲ್ಕು', 'ಹದಿನೈದು', 'ಹದಿನಾರು', 'ಹದಿನೇಳು', 'ಹದಿನೆಂಟು', 'ಹತ್ತೊಂಬತ್ತು',
    'ಇಪ್ಪತ್ತು', 'ಇಪ್ಪತ್ತೊಂದು', 'ಇಪ್ಪತ್ತೆರಡು', 'ಇಪ್ಪತ್ತಮೂರು', 'ಇಪ್ಪತ್ತನಾಲ್ಕು', 'ಇಪ್ಪತ್ತೈದು', 'ಇಪ್ಪತ್ತಾರು', 'ಇಪ್ಪತ್ತೇಳು', 'ಇಪ್ಪತ್ತೆಂಟು', 'ಇಪ್ಪತ್ತೊಂಬತ್ತು',
    'ಮೂವತ್ತು', 'ಮೂವತ್ತೊಂದು', 'ಮೂವತ್ತೆರಡು', 'ಮೂವತ್ತಮೂರು', 'ಮೂವತ್ತನಾಲ್ಕು', 'ಮೂವತ್ತೈದು', 'ಮೂವತ್ತಾರು', 'ಮೂವತ್ತೇಳು', 'ಮೂವತ್ತೆಂಟು', 'ಮೂವತ್ತೊಂಬತ್ತು',
    'ನಲವತ್ತು', 'ನಲವತ್ತೊಂದು', 'ನಲವತ್ತೆರಡು', 'ನಲವತ್ತಮೂರು', 'ನಲವತ್ತನಾಲ್ಕು', 'ನಲವತ್ತೈದು', 'ನಲವತ್ತಾರು', 'ನಲವತ್ತೇಳು', 'ನಲವತ್ತೆಂಟು', 'ನಲವತ್ತೊಂಬತ್ತು',
    'ಐವತ್ತು', 'ಐವತ್ತೊಂದು', 'ಐವತ್ತೆರಡು', 'ಐವತ್ತಮೂರು', 'ಐವತ್ತನಾಲ್ಕು', 'ಐವತ್ತೈದು', 'ಐವತ್ತಾರು', 'ಐವತ್ತೇಳು', 'ಐವತ್ತೆಂಟು', 'ಐವತ್ತೊಂಬತ್ತು',
    'ಅರವತ್ತು', 'ಅರವತ್ತೊಂದು', 'ಅರವತ್ತೆರಡು', 'ಅರವತ್ತಮೂರು', 'ಅರವತ್ತನಾಲ್ಕು', 'ಅರವತ್ತೈದು', 'ಅರವತ್ತಾರು', 'ಅರವತ್ತೇಳು', 'ಅರವತ್ತೆಂಟು', 'ಅರವತ್ತೊಂಬತ್ತು',
    'ಎಪ್ಪತ್ತು', 'ಎಪ್ಪತ್ತೊಂದು', 'ಎಪ್ಪತ್ತೆರಡು', 'ಎಪ್ಪತ್ತಮೂರು', 'ಎಪ್ಪತ್ತನಾಲ್ಕು', 'ಎಪ್ಪತ್ತೈದು', 'ಎಪ್ಪತ್ತಾರು', 'ಎಪ್ಪತ್ತೇಳು', 'ಎಪ್ಪತ್ತೆಂಟು', 'ಎಪ್ಪತ್ತೊಂಬತ್ತು',
    'ಎಂಬತ್ತು', 'ಎಂಬತ್ತೊಂದು', 'ಎಂಬತ್ತೆರಡು', 'ಎಂಬತ್ತಮೂರು', 'ಎಂಬತ್ತನಾಲ್ಕು', 'ಎಂಬತ್ತೈದು', 'ಎಂಬತ್ತಾರು', 'ಎಂಬತ್ತೇಳು', 'ಎಂಬತ್ತೆಂಟು', 'ಎಂಬತ್ತೊಂಬತ್ತು',
    'ತೊಂಬತ್ತು', 'ತೊಂಬತ್ತೊಂದು', 'ತೊಂಬತ್ತೆರಡು', 'ತೊಂಬತ್ತಮೂರು', 'ತೊಂಬತ್ತನಾಲ್ಕು', 'ತೊಂಬತ್ತೈದು', 'ತೊಂಬತ್ತಾರು', 'ತೊಂಬತ್ತೇಳು', 'ತೊಂಬತ್ತೆಂಟು', 'ತೊಂಬತ್ತೊಂಬತ್ತು'
  ]

  scaleWords = [
    '', // units
    'ಸಾವಿರ', // thousand (1,000)
    'ಲಕ್ಷ', // lakh (100,000)
    'ಕೋಟಿ', // crore (10,000,000)
    'ಅಬ್ಜ', // arab (1,000,000,000)
    'ಖರ್ವ', // kharab (100,000,000,000)
    'ನೀಲ', // neel (10,000,000,000,000)
    'ಪದ್ಮ', // padma (1,000,000,000,000,000)
    'ಶಂಖ' // shankh (100,000,000,000,000,000)
  ]
}

/**
 * Converts a number to Kannada cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @returns {string} The number expressed in Kannada words.
 * @throws {TypeError} If value is an invalid type.
 * @throws {Error} If value is NaN or an invalid number string.
 * @example
 * convertToWords(42); // 'ನಲವತ್ತೆರಡು'
 * convertToWords(1000); // 'ಒಂದು ಸಾವಿರ'
 * convertToWords(100000); // 'ಒಂದು ಲಕ್ಷ'
 */
export default function convertToWords (value, options = {}) {
  return new KannadaLanguage(options).convertToWords(value)
}
