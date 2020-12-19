import Num2Word from './i18n/EN.mjs';

/**
 * Convert number to words.
 *
 * @param {number} n The number to convert.
 * @returns {string} The number in words.
 */
export default function(n) {
  return new Num2Word().toCardinal(n);
}
