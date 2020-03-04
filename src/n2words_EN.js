import Num2Word_EN from './i18n/EN';

/**
 * Converts numbers to their written form.
 *
 * @constructor
 * @param {number} n - The number to convert
 */
export default function(n) {
  return new Num2Word_EN().toCardinal(n);
}