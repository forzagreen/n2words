/**
 * Checks if a value is numeric.
 *
 * @param {string|number} value - The value to check.
 * @returns {boolean} - True if the value is numeric, false otherwise.
 */
export function isNumeric(value) {
  if (!(typeof value == 'string' || typeof value == 'number')) return false;

  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

export default {};
