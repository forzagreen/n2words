export function isNumeric(value) {
  if (!(typeof value == 'string' || typeof value == 'number')) return false;

  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

export default {};
