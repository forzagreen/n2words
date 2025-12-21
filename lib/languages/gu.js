/**
 * Gujarati language implementation for n2words
 *
 * Gujarati uses Indian-style number grouping (3 digits, then 2-2 from right).
 * Numbers: શૂન્ય (0), એક (1), બે (2), ત્રણ (3), ચાર (4), પાંચ (5)...
 *
 * @module lib/languages/gu
 * @example
 * import gu from './lib/languages/gu.js'
 * gu(42) // 'બેતાળીસ'
 * gu(1000) // 'એક હજાર'
 */

import SouthAsianLanguage from '../classes/south-asian-language.js'

/**
 * Gujarati language implementation
 * Extends SouthAsianLanguage for Indian-style grouping
 */
class GujaratiLanguage extends SouthAsianLanguage {
  negativeWord = 'ઋણ'
  decimalSeparatorWord = 'દશાંશ'
  zeroWord = 'શૂન્ય'
  hundredWord = 'સો'
  convertDecimalsPerDigit = true

  belowHundred = [
    'શૂન્ય',
    'એક',
    'બે',
    'ત્રણ',
    'ચાર',
    'પાંચ',
    'છ',
    'સાત',
    'આઠ',
    'નવ',
    'દસ',
    'અગિયાર',
    'બાર',
    'તેર',
    'ચૌદ',
    'પંદર',
    'સોળ',
    'સત્તર',
    'અઢાર',
    'ઓગણીસ',
    'વીસ',
    'એકવીસ',
    'બાવીસ',
    'ત્રેવીસ',
    'ચોવીસ',
    'પચીસ',
    'છવ્વીસ',
    'સત્તાવીસ',
    'અઠ્ઠાવીસ',
    'ઓગણત્રીસ',
    'ત્રીસ',
    'એકત્રીસ',
    'બત્રીસ',
    'તેત્રીસ',
    'ચોત્રીસ',
    'પાંત્રીસ',
    'છત્રીસ',
    'સાડત્રીસ',
    'અડત્રીસ',
    'ઓગણચાલીસ',
    'ચાલીસ',
    'એકતાલીસ',
    'બેતાળીસ',
    'ત્રેતાળીસ',
    'ચુંમાલીસ',
    'પિસ્તાલીસ',
    'છેતાળીસ',
    'સુડતાળીસ',
    'અડતાળીસ',
    'ઓગણપચાસ',
    'પચાસ',
    'એકાવન',
    'બાવન',
    'ત્રેપન',
    'ચોપન',
    'પંચાવન',
    'છપ્પન',
    'સત્તાવન',
    'અઠ્ઠાવન',
    'ઓગણસાઠ',
    'સાઠ',
    'એકસઠ',
    'બાસઠ',
    'ત્રેસઠ',
    'ચોસઠ',
    'પાંસઠ',
    'છાસઠ',
    'સડસઠ',
    'અડસઠ',
    'અગણોસિત્તેર',
    'સિત્તેર',
    'એકોતેર',
    'બોતેર',
    'તોતેર',
    'ચુમોતેર',
    'પંચોતેર',
    'છોતેર',
    'સિત્યોતેર',
    'ઇઠ્યોતેર',
    'ઓગણાએંસી',
    'એંસી',
    'એક્યાસી',
    'બ્યાસી',
    'ત્યાસી',
    'ચોર્યાસી',
    'પંચાસી',
    'છ્યાસી',
    'સિત્યાસી',
    'અઠ્યાસી',
    'નેવ્યાસી',
    'નેવું',
    'એકાણું',
    'બાણું',
    'ત્રાણું',
    'ચોરાણું',
    'પંચાણું',
    'છન્નું',
    'સત્તાણું',
    'અઠ્ઠાણું',
    'નવ્વાણું'
  ]

  scaleWords = [
    '',
    'હજાર',
    'લાખ',
    'કરોડ',
    'અબજ',
    'ખરબ',
    'નીલ',
    'પદ્મ',
    'શંખ'
  ]
}

/**
 * Convert a number to Gujarati words
 *
 * @param {number|string|bigint} value - The number to convert
 * @param {Object} [options={}] - Conversion options
 * @returns {string} The Gujarati word representation
 * @example
 * convertToWords(42) // 'બેતાળીસ'
 * convertToWords(1000) // 'એક હજાર'
 * convertToWords(100000) // 'એક લાખ'
 */
export default function convertToWords (value, options = {}) {
  return new GujaratiLanguage(options).convertToWords(value)
}
